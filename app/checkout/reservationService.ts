
import "server-only";

import { randomUUID } from "crypto";

import { backendClient } from "@/sanity/lib/backendClient";
import { getStripeUnitAmount } from "./calculateOrder";
import type {
    CanonicalAddress,
    CanonicalProduct,
} from "./validateCheckout";

const RESERVATION_DURATION_SECONDS = 30 * 60;
const MAX_TRANSACTION_ATTEMPTS = 3;

export interface CheckoutReservationInput {
    userId: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    address: CanonicalAddress;
    requestedQuantities: Map<string, number>;
    canonicalProducts: Map<string, CanonicalProduct>;
}

interface ReservationDocument {
    _id: string;
    _rev: string;
    status: string;
    stripeCheckoutSessionId?: string;
    clerkUserId: string;
    items: {
        product: {
            _ref: string;
        };
        quantity: number;
        unitAmount: number;
    }[];
}

function buildAddressSnapshot(address: CanonicalAddress) {
    return {
        name: address.fullName || "",
        address: address.street || "",
        city: address.city || "",
        state: address.state || "",
        zip: address.zip || "",
    };
}

export function getReservationExpiry() {
    return new Date(
        Date.now() + RESERVATION_DURATION_SECONDS * 1000,
    );
}

export function getStripeReservationExpiry() {
    return Math.floor(
        (Date.now() + RESERVATION_DURATION_SECONDS * 1000) / 1000,
    );
}

export async function reserveInventory(
    input: CheckoutReservationInput,
) {
    const reservationId = `checkout-reservation-${randomUUID()}`;
    const reservationDocumentId = reservationId;
    const now = new Date().toISOString();
    const expiresAt = getReservationExpiry().toISOString();

    const productIds = [...input.requestedQuantities.keys()];

    if (productIds.length === 0) {
        throw new Error("Your cart is empty.");
    }

    const reservationItems = productIds.map((productId) => {
        const product = input.canonicalProducts.get(productId);
        const quantity = input.requestedQuantities.get(productId);

        if (!product || !quantity) {
            throw new Error(
                "A checkout product could not be verified.",
            );
        }

        return {
            _key: randomUUID(),
            product: {
                _type: "reference" as const,
                _ref: productId,
            },
            quantity,
            unitAmount: getStripeUnitAmount(product),
        };
    });

    const reservationData = {
        _id: reservationDocumentId,
        _type: "checkoutReservation",
        reservationId,
        orderNumber: input.orderNumber,
        clerkUserId: input.userId,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        address: buildAddressSnapshot(input.address),
        items: reservationItems,
        status: "active",
        createdAt: now,
        expiresAt,
    };

    for (
        let attempt = 1;
        attempt <= MAX_TRANSACTION_ATTEMPTS;
        attempt += 1
    ) {
        const latestProducts = await backendClient
            .withConfig({ useCdn: false })
            .fetch<
                {
                    _id: string;
                    _rev: string;
                    stock?: number;
                    price?: number;
                    discount?: number;
                    status?: string;
                    vendor?: {
                        _id: string;
                        status?: string;
                    } | null;
                }[]
            >(
                `*[
                    _type == "product" &&
                    _id in $productIds
                ] {
                    _id,
                    _rev,
                    stock,
                    price,
                    discount,
                    status,
                    "vendor": vendor->{
                        _id,
                        status
                    }
                }`,
                { productIds },
            );

        const latestById = new Map(
            latestProducts.map((product) => [
                product._id,
                product,
            ]),
        );

        const stockUpdates: {
            productId: string;
            revision: string;
            newStock: number;
        }[] = [];

        for (const productId of productIds) {
            const latest = latestById.get(productId);
            const expected = input.canonicalProducts.get(productId);
            const quantity =
                input.requestedQuantities.get(productId);

            if (!latest || !expected || !quantity) {
                throw new Error(
                    "A product in your cart is no longer available.",
                );
            }

            if (
                latest.status === "draft" ||
                latest.status === "archived"
            ) {
                throw new Error(
                    `"${expected.title || "Product"}" is no longer available.`,
                );
            }

            if (
                latest.vendor &&
                latest.vendor.status !== "approved"
            ) {
                throw new Error(
                    `"${expected.title || "Product"}" is unavailable because its vendor is not approved.`,
                );
            }

            if (
                typeof latest.stock !== "number" ||
                !Number.isSafeInteger(latest.stock) ||
                latest.stock < 0
            ) {
                throw new Error(
                    `"${expected.title || "Product"}" has an invalid stock configuration.`,
                );
            }

            if (latest.stock < quantity) {
                throw new Error(
                    `Insufficient stock for "${expected.title || "Product"}". Available: ${latest.stock}, requested: ${quantity}.`,
                );
            }

            const latestUnitAmount = getStripeUnitAmount({
                price: latest.price,
                discount: latest.discount,
                title: expected.title,
            });

            const expectedUnitAmount =
                getStripeUnitAmount(expected);

            if (latestUnitAmount !== expectedUnitAmount) {
                throw new Error(
                    `"${expected.title || "Product"}" has changed price. Please review your cart and try again.`,
                );
            }

            if (!latest._rev) {
                throw new Error(
                    `Product ${productId} is missing its revision identifier.`,
                );
            }

            stockUpdates.push({
                productId,
                revision: latest._rev,
                newStock: latest.stock - quantity,
            });
        }

        const transaction = backendClient.transaction();

        for (const update of stockUpdates) {
            transaction.patch(
                update.productId,
                (patch) =>
                    patch
                        .ifRevisionId(update.revision)
                        .set({ stock: update.newStock }),
            );
        }

        transaction.create(reservationData);

        try {
            await transaction.commit();

            return {
                reservationId,
                expiresAt,
                expiresAtUnix: Math.floor(
                    new Date(expiresAt).getTime() / 1000,
                ),
            };
        } catch (error) {
            // A commit may have succeeded even if its response was lost.
            const existingReservation =
                await backendClient.getDocument<ReservationDocument>(
                    reservationDocumentId,
                );

            if (existingReservation) {
                if (existingReservation.status === "active") {
                    return {
                        reservationId,
                        expiresAt,
                        expiresAtUnix: Math.floor(
                            new Date(expiresAt).getTime() / 1000,
                        ),
                    };
                }

                throw new Error(
                    "The checkout reservation could not be confirmed.",
                );
            }

            if (attempt === MAX_TRANSACTION_ATTEMPTS) {
                console.error(
                    "Inventory reservation transaction failed:",
                    error,
                );

                throw new Error(
                    "We couldn't reserve your products. Please try checkout again.",
                );
            }
        }
    }

    throw new Error(
        "We couldn't reserve your products. Please try again.",
    );
}

export async function attachStripeSessionToReservation(
    reservationId: string,
    sessionId: string,
) {
    const reservation =
        await backendClient.getDocument<ReservationDocument>(
            reservationId,
        );

    if (!reservation || reservation.status !== "active") {
        throw new Error(
            "The checkout reservation is no longer active.",
        );
    }

    if (
        reservation.stripeCheckoutSessionId &&
        reservation.stripeCheckoutSessionId !== sessionId
    ) {
        throw new Error(
            "The reservation is already attached to another checkout session.",
        );
    }

    await backendClient
        .patch(reservationId)
        .ifRevisionId(reservation._rev)
        .set({ stripeCheckoutSessionId: sessionId })
        .commit();
}

export async function releaseCheckoutReservation(
    reservationId: string,
    sessionId?: string,
) {
    for (
        let attempt = 1;
        attempt <= MAX_TRANSACTION_ATTEMPTS;
        attempt += 1
    ) {
        const reservation =
            await backendClient.getDocument<ReservationDocument>(
                reservationId,
            );

        if (!reservation) {
            console.warn(
                `Checkout reservation ${reservationId} was not found.`,
            );
            return { released: false, reason: "not_found" as const };
        }

        if (reservation.status === "released") {
            return { released: false, reason: "already_released" as const };
        }

        if (reservation.status === "consumed") {
            return { released: false, reason: "already_consumed" as const };
        }

        if (reservation.status !== "active") {
            return { released: false, reason: "not_active" as const };
        }

        if (
            sessionId &&
            reservation.stripeCheckoutSessionId &&
            reservation.stripeCheckoutSessionId !== sessionId
        ) {
            throw new Error(
                "The Stripe session does not match the reservation.",
            );
        }

        if (!reservation._rev || !Array.isArray(reservation.items)) {
            throw new Error(
                "The checkout reservation is incomplete.",
            );
        }

        const quantities = new Map<string, number>();

        for (const item of reservation.items) {
            const productId = item.product?._ref;

            if (
                !productId ||
                !Number.isSafeInteger(item.quantity) ||
                item.quantity < 1
            ) {
                throw new Error(
                    "The reservation contains invalid product quantities.",
                );
            }

            quantities.set(
                productId,
                (quantities.get(productId) ?? 0) + item.quantity,
            );
        }

        const productIds = [...quantities.keys()];

        const products = await Promise.all(
            productIds.map(async (productId) => {
                const product =
                    await backendClient.getDocument<{
                        _id: string;
                        _rev: string;
                        stock?: number;
                    }>(productId);

                if (
                    !product ||
                    !product._rev ||
                    typeof product.stock !== "number" ||
                    !Number.isSafeInteger(product.stock) ||
                    product.stock < 0
                ) {
                    throw new Error(
                        `Cannot safely restore inventory for product ${productId}.`,
                    );
                }

                return {
                    productId,
                    revision: product._rev,
                    newStock:
                        product.stock + (quantities.get(productId) ?? 0),
                };
            }),
        );

        const transaction = backendClient.transaction();

        for (const product of products) {
            transaction.patch(
                product.productId,
                (patch) =>
                    patch
                        .ifRevisionId(product.revision)
                        .set({ stock: product.newStock }),
            );
        }

        transaction.patch(
            reservationId,
            (patch) =>
                patch
                    .ifRevisionId(reservation._rev)
                    .set({
                        status: "released",
                        releasedAt: new Date().toISOString(),
                        ...(sessionId
                            ? { stripeCheckoutSessionId: sessionId }
                            : {}),
                    }),
        );

        try {
            await transaction.commit();

            return { released: true, reason: "released" as const };
        } catch (error) {
            const latest =
                await backendClient.getDocument<ReservationDocument>(
                    reservationId,
                );

            if (latest?.status === "released") {
                return {
                    released: false,
                    reason: "already_released" as const,
                };
            }

            if (latest?.status === "consumed") {
                return {
                    released: false,
                    reason: "already_consumed" as const,
                };
            }

            if (attempt === MAX_TRANSACTION_ATTEMPTS) {
                console.error(
                    "Checkout reservation release failed:",
                    error,
                );
                throw new Error(
                    "Inventory release failed. The operation must be retried.",
                );
            }
        }
    }

    throw new Error("Unable to release the checkout reservation.");
}
