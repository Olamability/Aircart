
import "server-only";

import type Stripe from "stripe";

import stripe from "@/lib/stripe";
import {
    buildAddressMetadata,
    buildStripeLineItems,
} from "./calculateOrder";
import type {
    CanonicalAddress,
    CanonicalProduct,
} from "./validateCheckout";

interface CreateStripeSessionInput {
    userId: string;
    customerName: string;
    customerEmail: string;
    orderNumber: string;
    reservationId: string;
    expiresAtUnix: number;
    address: CanonicalAddress;
    requestedQuantities: Map<string, number>;
    canonicalProducts: Map<string, CanonicalProduct>;
    successUrl: string;
    cancelUrl: string;
}

export async function createStripeCheckoutSession({
    userId,
    customerName,
    customerEmail,
    orderNumber,
    reservationId,
    expiresAtUnix,
    address,
    requestedQuantities,
    canonicalProducts,
    successUrl,
    cancelUrl,
}: CreateStripeSessionInput) {
    if (!customerEmail) {
        throw new Error(
            "A valid email address is required to complete checkout.",
        );
    }

    if (!orderNumber || !reservationId) {
        throw new Error(
            "Checkout reservation information is missing.",
        );
    }

    if (!successUrl || !cancelUrl) {
        throw new Error("Checkout return URLs are not configured.");
    }

    if (
        !Number.isSafeInteger(expiresAtUnix) ||
        expiresAtUnix < Math.floor(Date.now() / 1000) + 30 * 60 ||
        expiresAtUnix > Math.floor(Date.now() / 1000) + 24 * 60 * 60
    ) {
        throw new Error(
            "The checkout reservation expiration is invalid.",
        );
    }

    const customers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
    });

    const customerId = customers.data[0]?.id;

    const finalSuccessUrl = successUrl.replace(
        "__ORDER_NUMBER__",
        encodeURIComponent(orderNumber),
    );

    const sessionPayload: Stripe.Checkout.SessionCreateParams = {
        metadata: {
            orderNumber,
            reservationId,
            customerName: customerName || "Customer",
            customerEmail,
            clerkUserId: userId,
            address: buildAddressMetadata(address),
            addressId: address._id,
        },
        mode: "payment",
        allow_promotion_codes: true,
        payment_method_types: ["card"],
        invoice_creation: {
            enabled: true,
        },
        expires_at: expiresAtUnix,
        success_url: finalSuccessUrl,
        cancel_url: cancelUrl,
        line_items: buildStripeLineItems(
            requestedQuantities,
            canonicalProducts,
        ),
    };

    if (customerId) {
        sessionPayload.customer = customerId;
    } else {
        sessionPayload.customer_email = customerEmail;
    }

    const session =
        await stripe.checkout.sessions.create(sessionPayload);

    if (!session.url) {
        throw new Error(
            "Stripe could not generate a checkout payment link.",
        );
    }

    return {
        url: session.url,
        sessionId: session.id,
        orderNumber,
    };
}
