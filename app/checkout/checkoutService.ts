
import "server-only";

import { randomBytes } from "crypto";

import stripe from "@/lib/stripe";
import { validateCheckout } from "./validateCheckout";
import { createStripeCheckoutSession } from "./createStripeSession";
import {
    attachStripeSessionToReservation,
    getStripeReservationExpiry,
    releaseCheckoutReservation,
    reserveInventory,
} from "./reservationService";

interface CreateCheckoutInput {
    userId: string;
    customerName: string;
    customerEmail: string;
    addressId: string;
    items: {
        productId: string;
        quantity: number;
    }[];
    successUrl: string;
    cancelUrl: string;
}

export function generateOrderNumber(): string {
    const date = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "");

    const suffix = randomBytes(6)
        .toString("hex")
        .toUpperCase();

    return `SPZ-${date}-${suffix}`;
}

export async function createCheckoutForCustomer(
    input: CreateCheckoutInput,
) {
    const validated = await validateCheckout({
        userId: input.userId,
        addressId: input.addressId,
        items: input.items,
    });

    const orderNumber = generateOrderNumber();

    const reservation = await reserveInventory({
        userId: input.userId,
        orderNumber,
        customerName: input.customerName || "Customer",
        customerEmail: input.customerEmail,
        address: validated.address,
        requestedQuantities: validated.requestedQuantities,
        canonicalProducts: validated.canonicalProducts,
    });

    let stripeSessionId: string | undefined;

    try {
        const session = await createStripeCheckoutSession({
            userId: input.userId,
            customerName: input.customerName,
            customerEmail: input.customerEmail,
            orderNumber,
            reservationId: reservation.reservationId,
            expiresAtUnix: getStripeReservationExpiry(),
            address: validated.address,
            requestedQuantities: validated.requestedQuantities,
            canonicalProducts: validated.canonicalProducts,
            successUrl: input.successUrl,
            cancelUrl: input.cancelUrl,
        });

        stripeSessionId = session.sessionId;

        await attachStripeSessionToReservation(
            reservation.reservationId,
            session.sessionId,
        );

        return {
            ...session,
            reservationId: reservation.reservationId,
        };
    } catch (error) {
        if (stripeSessionId) {
            try {
                const currentSession =
                    await stripe.checkout.sessions.retrieve(
                        stripeSessionId,
                    );

                if (currentSession.status === "open") {
                    await stripe.checkout.sessions.expire(
                        stripeSessionId,
                    );
                }
            } catch (expirationError) {
                console.error(
                    "Unable to expire an unlinked Stripe session:",
                    expirationError,
                );
            }
        }

        try {
            await releaseCheckoutReservation(
                reservation.reservationId,
                stripeSessionId,
            );
        } catch (releaseError) {
            console.error(
                "Unable to release inventory after checkout creation failed:",
                releaseError,
            );
        }

        throw error;
    }
}
