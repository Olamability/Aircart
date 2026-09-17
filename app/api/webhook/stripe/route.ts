import crypto from "crypto";
import stripe from "@/lib/stripe";
import { backendClient } from "@/sanity/lib/backendClient";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import type { Metadata } from "@/actions/createCheckoutSession";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headerList = await headers();
  const sig = headerList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "No Signature found for Stripe" },
      { status: 500 },
    );
  }

  const webhooksecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhooksecret) {
    return NextResponse.json(
      {
        error: "Stripe webhook secret is not set",
      },
      { status: 404 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhooksecret);
  } catch (error) {
    console.log("Webhook signature verification failed", error);

    return NextResponse.json(
      { error: `Webhook Error: ${error}` },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log("Stripe checkout completed:", session.id);
    console.log("Stripe webhook received:", event.type);

    try {
      let invoice: Stripe.Invoice | null = null;

      if (session.invoice) {
        const invoiceId =
          typeof session.invoice === "string"
            ? session.invoice
            : session.invoice.id;

        invoice = await stripe.invoices.retrieve(invoiceId);
      }

      await createOrderInSanity(session, invoice);
    } catch (error) {
      console.log("Error creating order in Sanity:", error);

      return NextResponse.json(
        {
          error: `Error creating order: ${error}`,
        },
        {
          status: 400,
        },
      );
    }
  }

  return NextResponse.json({ received: true });
}

async function createOrderInSanity(
  session: Stripe.Checkout.Session,
  invoice: Stripe.Invoice | null,
) {
  const {
    id,
    amount_total,
    currency,
    metadata,
    payment_intent,
    total_details,
  } = session;

  // Check if this order has already been created
  const existingOrder = await backendClient.fetch(
    `*[_type == "order" && stripeCheckoutSessionId == $sessionId][0]`,
    { sessionId: id },
  );

  if (existingOrder) {
    console.log(`Order already exists for session ${id}`);
    return existingOrder;
  }

  const { orderNumber, customerName, customerEmail, clerkUserId, address } =
    metadata as unknown as Metadata & {
      address?: string;
    };

  let parsedAddress = null;
  try {
    parsedAddress = address && address !== "undefined" ? JSON.parse(address) : null;
  } catch (error) {
    console.error("Failed to parse address from metadata:", error);
  }

  // Get Stripe line items and expand the Stripe products
  const lineItemsWithProduct = await stripe.checkout.sessions.listLineItems(
    id,
    {
      expand: ["data.price.product"],
    },
  );

  // Create Sanity product references and prepare stock updates
  const sanityProducts = [];
  const stockUpdates = [];

  for (const item of lineItemsWithProduct.data) {
    const productId = (item.price?.product as Stripe.Product)?.metadata?.id;

    const quantity = item.quantity || 0;

    if (!productId) {
      console.warn("No Sanity product ID found for Stripe line item");
      continue;
    }

    const priceAtPurchase =
      typeof item.price?.unit_amount === "number"
        ? item.price.unit_amount / 100
        : 0;

    sanityProducts.push({
      _key: crypto.randomUUID(),

      product: {
        _type: "reference",
        _ref: productId,
      },

      quantity,

      price: priceAtPurchase,
    });

    stockUpdates.push({
      productId,
      quantity,
    });
  }

  const paymentIntentId =
    typeof payment_intent === "string"
      ? payment_intent
      : (payment_intent?.id ?? undefined);

  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : (session.customer?.id ?? undefined);

  // Create order data
  const orderData = {
    _type: "order",

    orderNumber,

    stripeCheckoutSessionId: id,

    stripeCustomerId,

    stripePaymentIntentId: paymentIntentId,

    paymentReference: paymentIntentId,

    paymentStatus: "paid",

    clerkUserId,

    customerName,

    customerEmail,

    products: sanityProducts,

    totalPrice: amount_total ? amount_total / 100 : 0,

    currency: currency ?? "ngn",

    amountDiscount: total_details?.amount_discount
      ? total_details.amount_discount / 100
      : 0,

    status: "processing",

    orderDate: new Date().toISOString(),

    createdAt: new Date().toISOString(),

    ...(parsedAddress
      ? {
          address: {
            state: parsedAddress.state,
            zip: parsedAddress.zip,
            city: parsedAddress.city,
            address: parsedAddress.address,
            name: parsedAddress.name,
          },
        }
      : {}),

    ...(invoice
      ? {
          invoice: {
            id: invoice.id,
            number: invoice.number ?? undefined,
            hosted_invoice_url: invoice.hosted_invoice_url ?? undefined,
          },
        }
      : {}),
  };

  // Only add address if an address actually exists
  if (parsedAddress) {
    orderData.address = {
      state: parsedAddress.state,
      zip: parsedAddress.zip,
      city: parsedAddress.city,
      address: parsedAddress.address,
      name: parsedAddress.name,
    };
  }

  // Only add invoice if Stripe actually created one
  if (invoice) {
    orderData.invoice = {
      id: invoice.id,
      number: invoice.number ?? undefined,
      hosted_invoice_url: invoice.hosted_invoice_url ?? undefined,
    };
  }

  // Create order in Sanity
  const order = await backendClient.create(orderData);

  // Update product stock
  await updateStockLevels(stockUpdates);

  return order;
}

async function updateStockLevels(
  stockUpdates: { productId: string; quantity: number }[],
) {
  for (const { productId, quantity } of stockUpdates) {
    try {
      const product = await backendClient.getDocument(productId);

      if (!product || typeof product.stock !== "number") {
        console.warn(
          `Product with ID ${productId} not found or stock is invalid.`,
        );

        continue;
      }

      const newStock = Math.max(product.stock - quantity, 0);

      await backendClient.patch(productId).set({ stock: newStock }).commit();
    } catch (error) {
      console.error(`Failed to update stock for product ${productId}:`, error);
    }
  }
}
