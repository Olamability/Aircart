
import "server-only";

import { backendClient } from "@/sanity/lib/backendClient";

export interface CheckoutItemInput {
    productId: string;
    quantity: number;
}

export interface CanonicalProduct {
    _id: string;
    title?: string;
    price?: number;
    discount?: number;
    stock?: number;
    status?: string;
    description?: string;
    image?: unknown[];
    vendor?: {
        _id: string;
        status?: string;
    } | null;
}

export interface CanonicalAddress {
    _id: string;
    label?: string;
    fullName?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    clerkUserId: string;
}

export interface ValidatedCheckout {
    address: CanonicalAddress;
    requestedQuantities: Map<string, number>;
    canonicalProducts: Map<string, CanonicalProduct>;
}

interface ValidateCheckoutInput {
    userId: string;
    addressId: string;
    items: CheckoutItemInput[];
}

const MAX_CHECKOUT_ITEMS = 100;

export async function validateCheckout({
    userId,
    addressId,
    items,
}: ValidateCheckoutInput): Promise<ValidatedCheckout> {
    if (!userId) {
        throw new Error("You must be signed in to checkout.");
    }

    if (
        typeof addressId !== "string" ||
        !addressId.trim()
    ) {
        throw new Error("Please select a delivery address before checkout.");
    }

    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Your cart is empty.");
    }

    if (items.length > MAX_CHECKOUT_ITEMS) {
        throw new Error("Your cart contains too many items.");
    }

    const addresses = await backendClient
        .withConfig({ useCdn: false })
        .fetch<CanonicalAddress[]>(
            `*[
        _type == "address" &&
        _id == $addressId &&
        clerkUserId == $userId
      ][0...1] {
        _id,
        label,
        fullName,
        street,
        city,
        state,
        zip,
        clerkUserId
      }`,
            {
                addressId: addressId.trim(),
                userId,
            },
        );

    const address = addresses[0];

    if (!address) {
        throw new Error(
            "The selected delivery address could not be verified. Please select a valid address.",
        );
    }

    const requestedQuantities = new Map<string, number>();

    for (const item of items) {
        const productId =
            typeof item?.productId === "string"
                ? item.productId.trim()
                : "";

        if (!productId) {
            throw new Error(
                "One or more cart items are missing a valid product ID.",
            );
        }

        if (
            !Number.isSafeInteger(item.quantity) ||
            item.quantity <= 0
        ) {
            throw new Error("One or more cart quantities are invalid.");
        }

        const combinedQuantity =
            (requestedQuantities.get(productId) ?? 0) +
            item.quantity;

        if (!Number.isSafeInteger(combinedQuantity)) {
            throw new Error("One or more cart quantities are invalid.");
        }

        requestedQuantities.set(productId, combinedQuantity);
    }

    const productIds = [...requestedQuantities.keys()];

    const products = await backendClient
        .withConfig({ useCdn: false })
        .fetch<CanonicalProduct[]>(
            `*[_type == "product" && _id in $productIds] {
        _id,
        title,
        price,
        discount,
        stock,
        status,
        description,
        image,
        "vendor": vendor->{
          _id,
          status
        }
      }`,
            { productIds },
        );

    const canonicalProducts = new Map(
        products.map((product) => [product._id, product]),
    );

    for (const [productId, quantity] of requestedQuantities) {
        const product = canonicalProducts.get(productId);

        if (!product) {
            throw new Error(
                "A product in your cart is no longer available. Please review your cart.",
            );
        }

        const productName = product.title || product._id;

        if (
            product.status === "draft" ||
            product.status === "archived"
        ) {
            throw new Error(
                `"${productName}" is not currently available for purchase.`,
            );
        }

        if (
            product.vendor &&
            product.vendor.status !== "approved"
        ) {
            throw new Error(
                `"${productName}" is currently unavailable because its vendor is not approved.`,
            );
        }

        if (
            typeof product.stock !== "number" ||
            !Number.isFinite(product.stock) ||
            product.stock < 0
        ) {
            throw new Error(
                `"${productName}" has an invalid stock configuration.`,
            );
        }

        if (product.stock <= 0) {
            throw new Error(
                `"${productName}" is currently out of stock.`,
            );
        }

        if (product.stock < quantity) {
            throw new Error(
                `Insufficient stock for "${productName}". Available: ${product.stock}, requested: ${quantity}.`,
            );
        }

        if (
            typeof product.price !== "number" ||
            !Number.isFinite(product.price) ||
            product.price < 0
        ) {
            throw new Error(`"${productName}" has an invalid price.`);
        }

        const discount = product.discount ?? 0;

        if (
            typeof discount !== "number" ||
            !Number.isFinite(discount) ||
            discount < 0 ||
            discount > 100
        ) {
            throw new Error(
                `"${productName}" has an invalid discount configured.`,
            );
        }

        const unitAmount = Math.round(
            product.price * (1 - discount / 100) * 100,
        );

        if (
            !Number.isSafeInteger(unitAmount) ||
            unitAmount < 0
        ) {
            throw new Error(
                `"${productName}" has an invalid checkout price.`,
            );
        }
    }

    return {
        address,
        requestedQuantities,
        canonicalProducts,
    };
}
