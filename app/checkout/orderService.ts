
import "server-only";

import { createHash, randomUUID } from "crypto";
import type Stripe from "stripe";

import stripe from "@/lib/stripe";
import { backendClient } from "@/sanity/lib/backendClient";

interface ReservationItem {
    _key?: string;
    product: {
        _ref: string;
    };
    quantity: number;
    unitAmount: number;
}

interface CheckoutReservation {
    _id: string;
    _rev: string;
    reservationId: string;
    stripeCheckoutSessionId?: string;
    orderNumber: string;
    clerkUserId: string;
    customerName: string;
    customerEmail: string;
    address?: {
        name?: string;
        address?: string;
        city?: string;
        state?: string;
        zip?: string;
    };
    items: ReservationItem[];
    status: "active" | "consumed" | "released" | "reconciliation_required";
}

type ParsedAddress = {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
};

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
            name:
                typeof value.name === "string"
                    ? value.name
                    : undefined,
            address:
                typeof value.address === "string"
                    ? value.address
                    : undefined,
            city:
                typeof value.city === "string"
                    ? value.city
                    : undefined,
            state:
                typeof value.state === "string"
                    ? value.state
                    : undefined,
            zip:
                typeof value.zip === "string"
                    ? value.zip
                    : undefined,
        };
    } catch {
        throw new Error(
            "Unable to parse checkout address metadata.",
        );
    }
}

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
                ...(startingAfter
                    ? { starting_after: startingAfter }
                    : {}),
            },
        );

        allItems.push(...page.data);

        if (!page.has_more) {
            break;
        }

        const lastItem = page.data[page.data.length - 1];

        if (!lastItem) {
            throw new Error(
                "Stripe returned an incomplete line-item page.",
            );
        }

        startingAfter = lastItem.id;
    }

    return allItems;
}



export async function createOrderInSanity(
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

    if (session.payment_status !== "paid") {
        throw new Error(
            "Cannot create an order for an unpaid Stripe session.",
        );
    }

    if (!metadata) {
        throw new Error("Checkout Session metadata is missing.");
    }

    const {
        orderNumber,
        customerName,
        customerEmail,
        clerkUserId,
        address,
        reservationId,
    } = metadata;

    if (
        !orderNumber ||
        !customerName ||
        !customerEmail ||
        !clerkUserId ||
        !reservationId
    ) {
        throw new Error(
            "Required checkout or reservation metadata is missing.",
        );
    }

    if (
        amount_total === null ||
        !Number.isSafeInteger(amount_total) ||
        amount_total < 0
    ) {
        throw new Error("Stripe returned an invalid order total.");
    }

    if (currency?.toLowerCase() !== "ngn") {
        throw new Error(
            "The checkout session has an unsupported currency.",
        );
    }

    const orderId = `stripe-order-${createHash("sha256")
        .update(sessionId)
        .digest("hex")}`;

    const existingOrder = await backendClient.fetch(
        `*[
            _type == "order" &&
            stripeCheckoutSessionId == $sessionId
        ][0]`,
        { sessionId },
    );

    if (existingOrder) {
        return existingOrder;
    }

    const reservation =
        await backendClient.getDocument<CheckoutReservation>(
            reservationId,
        );

    if (!reservation) {
        throw new Error(
            `Checkout reservation ${reservationId} was not found.`,
        );
    }

    if (
        reservation.reservationId !== reservationId ||
        reservation.clerkUserId !== clerkUserId ||
        reservation.orderNumber !== orderNumber ||
        reservation.customerEmail.toLowerCase() !==
        customerEmail.toLowerCase()
    ) {
        throw new Error(
            "The Stripe session does not match its checkout reservation.",
        );
    }

    if (reservation.stripeCheckoutSessionId &&
        reservation.stripeCheckoutSessionId !== sessionId) {
        throw new Error(
            "The Stripe session does not match the reservation session.",
        );
    }

    if (reservation.status === "consumed") {
        const consumedOrder = await backendClient.getDocument(orderId);

        if (consumedOrder) {
            return consumedOrder;
        }

        throw new Error(
            "The reservation was consumed but its order could not be found.",
        );
    }

    if (reservation.status !== "active") {
        throw new Error(
            `Cannot fulfil a checkout with reservation status "${reservation.status}".`,
        );
    }

    if (!reservation._rev || !reservation.items?.length) {
        throw new Error(
            "The checkout reservation is incomplete.",
        );
    }

    const parsedAddress =
        reservation.address || parseAddress(address);

    const lineItems = await getAllCheckoutLineItems(sessionId);

    if (lineItems.length === 0) {
        throw new Error(
            "No products were found in the Stripe Checkout Session.",
        );
    }

    const reservedQuantities = new Map<string, number>();

    for (const item of reservation.items) {
        const productId = item.product?._ref;

        if (
            !productId ||
            !Number.isSafeInteger(item.quantity) ||
            item.quantity < 1 ||
            !Number.isSafeInteger(item.unitAmount) ||
            item.unitAmount < 0
        ) {
            throw new Error(
                "The reservation contains invalid product information.",
            );
        }

        reservedQuantities.set(
            productId,
            (reservedQuantities.get(productId) ?? 0) +
            item.quantity,
        );
    }

    const stripeQuantities = new Map<string, number>();

    for (const item of lineItems) {
        const stripeProduct = item.price?.product;

        if (
            !stripeProduct ||
            typeof stripeProduct === "string" ||
            stripeProduct.deleted
        ) {
            throw new Error(
                `Stripe product information is missing for line item ${item.id}.`,
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

        if (
            !Number.isSafeInteger(quantity) ||
            !quantity ||
            quantity < 1
        ) {
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

        const reservedItem = reservation.items.find(
            (entry) => entry.product._ref === productId,
        );

        if (!reservedItem || reservedItem.unitAmount !== unitAmount) {
            throw new Error(
                `Stripe price does not match the reservation for product ${productId}.`,
            );
        }

        stripeQuantities.set(
            productId,
            (stripeQuantities.get(productId) ?? 0) + quantity,
        );
    }

    if (
        reservedQuantities.size !== stripeQuantities.size ||
        [...reservedQuantities.entries()].some(
            ([productId, quantity]) =>
                stripeQuantities.get(productId) !== quantity,
        )
    ) {
        throw new Error(
            "Stripe line items do not match the reserved checkout products.",
        );
    }

    const sanityProducts = reservation.items.map((item) => ({
        _key: randomUUID(),
        product: {
            _type: "reference" as const,
            _ref: item.product._ref,
        },
        quantity: item.quantity,
        price: item.unitAmount / 100,
    }));

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

    const transaction = backendClient.transaction();

    transaction.create(orderData);

    transaction.patch(
        reservationId,
        (patch) =>
            patch
                .ifRevisionId(reservation._rev)
                .set({
                    status: "consumed",
                    stripeCheckoutSessionId: sessionId,
                    stripePaymentIntentId: paymentIntentId,
                    paidAt: now,
                }),
    );

    try {
        await transaction.commit();
    } catch (error) {
        const orderAfterFailure =
            await backendClient.getDocument(orderId);

        if (orderAfterFailure) {
            return orderAfterFailure;
        }

        throw error;
    }

    const createdOrder = await backendClient.getDocument(orderId);

    if (!createdOrder) {
        throw new Error(
            `Order ${orderId} was committed but could not be retrieved.`,
        );
    }

    return createdOrder;
}
