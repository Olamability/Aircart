
import { createHash, randomUUID } from "crypto";
import stripe from "@/lib/stripe";
import { backendClient } from "@/sanity/lib/backendClient";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured.");

    return NextResponse.json(
      { error: "Webhook configuration error." },
      { status: 500 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);

    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 },
    );
  }

  // This handler currently processes completed Checkout Sessions.
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Never create an order until Stripe confirms payment.
  if (session.payment_status !== "paid") {
    console.warn(
      `Checkout session ${session.id} completed without a paid status.`,
    );

    return NextResponse.json({
      received: true,
      message: "Payment is not complete. No order was created.",
    });
  }

  try {
    let invoice: Stripe.Invoice | null = null;

    if (session.invoice) {
      const invoiceId =
        typeof session.invoice === "string"
          ? session.invoice
          : session.invoice.id;

      invoice = await stripe.invoices.retrieve(invoiceId);
    }

    const order = await createOrderInSanity(
      session,
      event.id,
      invoice,
    );

    console.log(
      `Stripe event ${event.id} processed for session ${session.id}.`,
    );

    return NextResponse.json({
      received: true,
      orderId: order._id,
    });
  } catch (error) {
    console.error(
      `Failed to process Stripe event ${event.id}:`,
      error,
    );

    // A 500 response allows Stripe to retry transient failures.
    return NextResponse.json(
      { error: "Order processing failed. Stripe can retry this event." },
      { status: 500 },
    );
  }
}

type ParsedAddress = {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
};

type StockUpdate = {
  productId: string;
  quantity: number;
};

async function createOrderInSanity(
  session: Stripe.Checkout.Session,
  stripeEventId: string,
  invoice: Stripe.Invoice | null,
) {
  const {
    id: sessionId,
    amount_total,
    currency,
    metadata,
    payment_intent,
    customer,
    total_details,
  } = session;

  if (!metadata) {
    throw new Error("Checkout Session metadata is missing.");
  }

  const {
    orderNumber,
    customerName,
    customerEmail,
    clerkUserId,
    address,
  } = metadata;

  if (!orderNumber || !customerName || !customerEmail || !clerkUserId) {
    throw new Error(
      "Required customer or order metadata is missing from the Checkout Session.",
    );
  }

  if (amount_total === null || amount_total < 0) {
    throw new Error("Stripe returned an invalid order total.");
  }

  if (!currency) {
    throw new Error("Stripe Checkout Session currency is missing.");
  }

  // A deterministic document ID prevents the same Checkout Session
  // from creating multiple Sanity orders.
  const orderId = `stripe-order-${createHash("sha256")
    .update(sessionId)
    .digest("hex")}`;

  // Check for an existing order before processing inventory.
  const existingOrder = await backendClient.fetch(
    `*[_type == "order" && stripeCheckoutSessionId == $sessionId][0]`,
    { sessionId },
  );

  if (existingOrder) {
    console.log(`Order already exists for session ${sessionId}.`);
    return existingOrder;
  }

  // Also check the deterministic ID in case an earlier attempt
  // created the document before a response was received.
  const existingById = await backendClient.fetch(
    `*[_id == $orderId][0]`,
    { orderId },
  );

  if (existingById) {
    return existingById;
  }

  const parsedAddress = parseAddress(address);

  // Retrieve every line item, not just the first page.
  const lineItems = await getAllCheckoutLineItems(sessionId);

  if (lineItems.length === 0) {
    throw new Error("No products were found in the Stripe Checkout Session.");
  }

  const sanityProducts: {
    _key: string;
    product: {
      _type: "reference";
      _ref: string;
    };
    quantity: number;
    price: number;
  }[] = [];

  // Aggregate duplicate product IDs before checking stock.
  const stockMap = new Map<string, number>();

  for (const item of lineItems) {
    const stripeProduct = item.price?.product;

    if (
      !stripeProduct ||
      typeof stripeProduct === "string" ||
      stripeProduct.deleted
    ) {
      throw new Error(
        `Stripe product information is missing or deleted for line item ${item.id}.`,
      );
    }

    const productId = stripeProduct.metadata?.id;
    const quantity = item.quantity;
    const unitAmount = item.price?.unit_amount;

    if (!productId) {
      throw new Error(
        `Sanity product ID is missing for Stripe line item ${item.id}.`,
      );
    }

    if (!Number.isSafeInteger(quantity) || !quantity || quantity < 1) {
      throw new Error(
        `Invalid quantity for Stripe line item ${item.id}.`,
      );
    }

    if (
      typeof unitAmount !== "number" ||
      !Number.isSafeInteger(unitAmount) ||
      unitAmount < 0
    ) {
      throw new Error(
        `Invalid unit price for Stripe line item ${item.id}.`,
      );
    }

    sanityProducts.push({
      _key: randomUUID(),
      product: {
        _type: "reference",
        _ref: productId,
      },
      quantity,
      price: unitAmount / 100,
    });

    stockMap.set(
      productId,
      (stockMap.get(productId) ?? 0) + quantity,
    );
  }

  const stockUpdates: StockUpdate[] = Array.from(
    stockMap.entries(),
  ).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));

  // Read current stock and revision numbers before creating the transaction.
  const stockDocuments = await Promise.all(
    stockUpdates.map(async ({ productId, quantity }) => {
      const product = await backendClient.getDocument(productId);

      if (!product) {
        throw new Error(`Product ${productId} no longer exists.`);
      }

      if (
        typeof product.stock !== "number" ||
        !Number.isFinite(product.stock) ||
        product.stock < 0
      ) {
        throw new Error(
          `Product ${productId} has an invalid stock value.`,
        );
      }

      if (!product._rev) {
        throw new Error(
          `Product ${productId} is missing its revision identifier.`,
        );
      }

      if (product.stock < quantity) {
        throw new Error(
          `Insufficient stock for product ${productId}. Available: ${product.stock}; ordered: ${quantity}.`,
        );
      }

      return {
        productId,
        revision: product._rev,
        newStock: product.stock - quantity,
      };
    }),
  );

  const paymentIntentId =
    typeof payment_intent === "string"
      ? payment_intent
      : payment_intent?.id;

  const stripeCustomerId =
    typeof customer === "string"
      ? customer
      : customer?.id;

  const now = new Date().toISOString();

  const orderData = {
    _id: orderId,
    _type: "order",

    orderNumber,

    stripeCheckoutSessionId: sessionId,
    stripeEventId,

    stripeCustomerId,
    stripePaymentIntentId: paymentIntentId,
    paymentReference: paymentIntentId,

    paymentStatus: "paid",

    clerkUserId,
    customerName,
    customerEmail,

    products: sanityProducts,

    totalPrice: amount_total / 100,
    currency: currency.toLowerCase(),

    // This is the additional Stripe promotion discount.
    // Product-level discounts are already reflected in Stripe unit prices.
    amountDiscount:
      (total_details?.amount_discount ?? 0) / 100,

    status: "processing",

    orderDate: now,
    createdAt: now,

    ...(parsedAddress
      ? {
        address: {
          name: parsedAddress.name,
          address: parsedAddress.address,
          city: parsedAddress.city,
          state: parsedAddress.state,
          zip: parsedAddress.zip,
        },
      }
      : {}),

    ...(invoice
      ? {
        invoice: {
          id: invoice.id,
          number: invoice.number ?? undefined,
          hosted_invoice_url:
            invoice.hosted_invoice_url ?? undefined,
        },
      }
      : {}),
  };

  // Create the order and deduct inventory atomically.
  // Revision checks prevent silently overwriting concurrent stock changes.
  const transaction = backendClient.transaction();

  transaction.create(orderData);

  for (const stockDocument of stockDocuments) {
    transaction.patch(
      stockDocument.productId,
      (patch) =>
        patch
          .ifRevisionId(stockDocument.revision)
          .set({ stock: stockDocument.newStock }),
    );
  }

  try {
    await transaction.commit();
  } catch (error) {
    // A duplicate delivery may have raced with another webhook execution.
    const orderAfterFailure = await backendClient.getDocument(orderId);

    if (orderAfterFailure) {
      console.log(
        `Order ${orderId} already exists. Treating this as a duplicate delivery.`,
      );

      return orderAfterFailure;
    }

    // Do not swallow revision conflicts or inventory failures.
    // Stripe should retry transient failures.
    throw error;
  }

  // Confirm that the committed order can be retrieved from Sanity.
  const createdOrder = await backendClient.getDocument(orderId);

  if (!createdOrder) {
    throw new Error(
      `Order ${orderId} was committed but could not be retrieved.`,
    );
  }

  return createdOrder;

  async function getAllCheckoutLineItems(
    sessionId: string,
  ): Promise<Stripe.LineItem[]> {
    const allItems: Stripe.LineItem[] = [];
    let startingAfter: string | undefined;

    while (true) {
      const page = await stripe.checkout.sessions.listLineItems(
        sessionId,
        {
          limit: 100,
          expand: ["data.price.product"],
          ...(startingAfter ? { starting_after: startingAfter } : {}),
        },
      );

      allItems.push(...page.data);

      if (!page.has_more) {
        break;
      }

      const lastItem = page.data[page.data.length - 1];

      if (!lastItem) {
        throw new Error(
          "Stripe indicated more line items but returned an empty page.",
        );
      }

      startingAfter = lastItem.id;
    }

    return allItems;
  }

  function parseAddress(
    address: string | undefined,
  ): ParsedAddress | null {
    if (!address || address === "undefined") {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(address);

      if (!parsed || typeof parsed !== "object") {
        throw new Error("Address metadata is not an object.");
      }

      const value = parsed as Record<string, unknown>;

      return {
        name: typeof value.name === "string" ? value.name : undefined,
        address:
          typeof value.address === "string" ? value.address : undefined,
        city: typeof value.city === "string" ? value.city : undefined,
        state: typeof value.state === "string" ? value.state : undefined,
        zip: typeof value.zip === "string" ? value.zip : undefined,
      };
    } catch (error) {
      throw new Error(
        `Unable to parse checkout address metadata: ${String(error)}`,
      );
    }
  }
}
