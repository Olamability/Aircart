"use server";

import stripe from "@/lib/stripe";
import { urlFor } from "@/sanity/lib/image";
import { CartItem } from "@/store";
import { backendClient } from "@/sanity/lib/backendClient";
import { auth, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

export interface Metadata {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  clerkUserId?: string;

  address?: {
    label: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  } | null;
}

export interface GroupedCartItems {
  product: CartItem["product"];
  quantity: number;
}

interface CanonicalProduct {
  _id: string;
  title?: string;
  price?: number;
  discount?: number;
  stock?: number;
  status?: string;
  description?: string;
  image?: unknown[];
}

export async function createCheckoutSession(
  items: GroupedCartItems[],
  metadata: Metadata,
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("You must be signed in to checkout.");
    }

    if (!items || items.length === 0) {
      throw new Error("Your cart is empty.");
    }

    const productIds = items
      .map((item) => item.product?._id)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    if (productIds.length !== items.length) {
      throw new Error("One or more cart items are missing a valid product ID.");
    }

    // Fetch canonical product records from Sanity without CDN caching
    const canonicalProducts = await backendClient
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
          image
        }`,
        { productIds },
      );

    const canonicalMap = new Map<string, CanonicalProduct>(
      canonicalProducts.map((p) => [p._id, p]),
    );

    // Validate each cart item against authoritative Sanity state
    for (const item of items) {
      const canonical = canonicalMap.get(item.product._id);
      if (!canonical) {
        throw new Error(
          `Product "${item.product.title || item.product._id}" is no longer available. Please remove it from your cart.`,
        );
      }

      if (typeof canonical.price !== "number" || canonical.price < 0) {
        throw new Error(
          `Product "${canonical.title || canonical._id}" does not have a valid price configured.`,
        );
      }

      if (typeof canonical.stock === "number" && canonical.stock <= 0) {
        throw new Error(
          `Product "${canonical.title || canonical._id}" is currently out of stock.`,
        );
      }

      if (typeof canonical.stock === "number" && canonical.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${canonical.title || canonical._id}". Available: ${canonical.stock}, requested: ${item.quantity}.`,
        );
      }
    }

    const user = await currentUser();
    const customerEmail =
      user?.emailAddresses?.[0]?.emailAddress || metadata.customerEmail;
    const customerName = user?.fullName || metadata.customerName || "Customer";

    // Look up existing Stripe customer
    const customers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    });

    const customerId = customers?.data?.length > 0 ? customers.data[0].id : "";

    // Build line items using authoritative Sanity prices and data
    const line_items = items.map((item) => {
      const canonical = canonicalMap.get(item.product._id)!;
      const unitAmount = Math.round((canonical.price ?? 0) * 100);

      let imageUrl: string | undefined = undefined;
      if (Array.isArray(canonical.image) && canonical.image.length > 0) {
        try {
          imageUrl = urlFor(canonical.image[0] as Parameters<typeof urlFor>[0]).url();
        } catch {
          imageUrl = undefined;
        }
      } else if (item.product.image && item.product.image.length > 0) {
        try {
          imageUrl = urlFor(item.product.image[0]).url();
        } catch {
          imageUrl = undefined;
        }
      }

      return {
        price_data: {
          currency: "NGN",
          unit_amount: unitAmount,
          product_data: {
            name: canonical.title || item.product?.title || "Unknown Product",
            description: canonical.description || item.product?.description,
            metadata: {
              id: canonical._id,
            },
            images: imageUrl ? [imageUrl] : undefined,
          },
        },
        quantity: item.quantity,
      };
    });

    const sessionPayload: Stripe.Checkout.SessionCreateParams = {
      metadata: {
        orderNumber: metadata.orderNumber,
        customerName,
        customerEmail,
        clerkUserId: userId,
        address: JSON.stringify(metadata.address),
      },

      mode: "payment",
      allow_promotion_codes: true,
      payment_method_types: ["card"],

      invoice_creation: {
        enabled: true,
      },

      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${metadata.orderNumber}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,

      line_items,
    };

    if (customerId) {
      sessionPayload.customer = customerId;
    } else {
      sessionPayload.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionPayload);

    return session.url;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}
