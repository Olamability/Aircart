
import "server-only";

import type Stripe from "stripe";

import { urlFor } from "@/sanity/lib/image";
import type { CanonicalProduct } from "./validateCheckout";

export function getValidPrice(price: unknown): number {
    if (
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price < 0
    ) {
        throw new Error("A product has an invalid price.");
    }

    return price;
}

export function getValidDiscount(discount: unknown): number {
    if (discount === undefined || discount === null) {
        return 0;
    }

    if (
        typeof discount !== "number" ||
        !Number.isFinite(discount) ||
        discount < 0 ||
        discount > 100
    ) {
        throw new Error("A product has an invalid discount configured.");
    }

    return discount;
}

export function getDiscountedPrice(
    price: number,
    discount: number,
): number {
    return price * (1 - discount / 100);
}

export function getStripeUnitAmount(
    product: Pick<CanonicalProduct, "price" | "discount" | "title">,
): number {
    const price = getValidPrice(product.price);
    const discount = getValidDiscount(product.discount);

    const unitAmount = Math.round(
        getDiscountedPrice(price, discount) * 100,
    );

    if (
        !Number.isSafeInteger(unitAmount) ||
        unitAmount < 0
    ) {
        throw new Error(
            `"${product.title || "Product"}" has an invalid checkout price.`,
        );
    }

    return unitAmount;
}

export function buildStripeLineItems(
    requestedQuantities: Map<string, number>,
    canonicalProducts: Map<string, CanonicalProduct>,
): Stripe.Checkout.SessionCreateParams.LineItem[] {
    return [...requestedQuantities.entries()].map(
        ([productId, quantity]) => {
            const product = canonicalProducts.get(productId);

            if (!product) {
                throw new Error(
                    `Validated product ${productId} could not be found.`,
                );
            }

            let imageUrl: string | undefined;

            if (
                Array.isArray(product.image) &&
                product.image.length > 0
            ) {
                try {
                    imageUrl = urlFor(
                        product.image[0] as Parameters<typeof urlFor>[0],
                    ).url();
                } catch {
                    imageUrl = undefined;
                }
            }

            return {
                price_data: {
                    currency: "NGN",
                    unit_amount: getStripeUnitAmount(product),
                    product_data: {
                        name: product.title || "Unknown Product",
                        description: product.description,
                        metadata: {
                            id: product._id,
                        },
                        images: imageUrl ? [imageUrl] : undefined,
                    },
                },
                quantity,
            };
        },
    );
}

export function buildAddressMetadata(address: {
    label?: string;
    fullName?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
}): string {
    const metadata = JSON.stringify({
        label: address.label || "",
        name: address.fullName || "",
        address: address.street || "",
        city: address.city || "",
        state: address.state || "",
        zip: address.zip || "",
    });

    if (metadata.length > 500) {
        throw new Error(
            "The selected delivery address is too long to process. Please review your saved address.",
        );
    }

    return metadata;
}
