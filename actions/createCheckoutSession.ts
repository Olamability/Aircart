
"use server";

import { randomUUID } from "crypto";
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
  addressId: string;
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
  vendor?: {
    _id: string;
    status?: string;
  } | null;
}

interface CanonicalAddress {
  _id: string;
  label?: string;
  fullName?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  clerkUserId: string;
}

const getValidPrice = (price: unknown): number => {
  if (
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    throw new Error("A product has an invalid price.");
  }

  return price;
};

const getValidDiscount = (discount: unknown): number => {
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
};

const getDiscountedPrice = (
  price: number,
  discount: number,
): number => {
  return price * (1 - discount / 100);
};

export async function createCheckoutSession(
  items: GroupedCartItems[],
  metadata: Metadata,
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("You must be signed in to checkout.");
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Your cart is empty.");
    }

    if (!metadata?.addressId) {
      throw new Error("Please select a delivery address before checkout.");
    }

    // Verify that the selected address belongs to the signed-in user.
    const verifiedAddresses = await backendClient
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
          addressId: metadata.addressId,
          userId,
        },
      );

    const verifiedAddress = verifiedAddresses[0];

    if (!verifiedAddress) {
      throw new Error(
        "The selected delivery address could not be verified. Please select a valid address.",
      );
    }

    // Validate product IDs and quantities, combining duplicate IDs.
    const requestedQuantities = new Map<string, number>();

    for (const item of items) {
      const productId = item?.product?._id;

      if (
        typeof productId !== "string" ||
        productId.trim().length === 0
      ) {
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

      const existingQuantity =
        requestedQuantities.get(productId) ?? 0;

      const combinedQuantity = existingQuantity + item.quantity;

      if (!Number.isSafeInteger(combinedQuantity)) {
        throw new Error("One or more cart quantities are invalid.");
      }

      requestedQuantities.set(productId, combinedQuantity);
    }

    const productIds = [...requestedQuantities.keys()];

    // Fetch authoritative product records from Sanity.
    // Vendor reference is resolved so vendor-owned products can
    // be checked against the current vendor approval status.
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
          image,
          "vendor": vendor->{
            _id,
            status
          }
        }`,
        { productIds },
      );

    const canonicalMap = new Map<string, CanonicalProduct>(
      canonicalProducts.map((product) => [
        product._id,
        product,
      ]),
    );

    // Validate every product using current Sanity data.
    for (const [productId, quantity] of requestedQuantities) {
      const canonical = canonicalMap.get(productId);

      if (!canonical) {
        throw new Error(
          `A product in your cart is no longer available. Please review your cart.`,
        );
      }

      const productName = canonical.title || canonical._id;

      if (
        canonical.status === "draft" ||
        canonical.status === "archived"
      ) {
        throw new Error(
          `"${productName}" is not currently available for purchase.`,
        );
      }

      // A vendor reference identifies a vendor-owned product.
      // Platform-owned products without a vendor reference are allowed.
      if (canonical.vendor) {
        if (canonical.vendor.status !== "approved") {
          throw new Error(
            `"${productName}" is currently unavailable because its vendor is not approved.`,
          );
        }
      }

      const price = getValidPrice(canonical.price);
      const discount = getValidDiscount(canonical.discount);

      if (
        typeof canonical.stock !== "number" ||
        !Number.isFinite(canonical.stock) ||
        canonical.stock < 0
      ) {
        throw new Error(
          `"${productName}" has an invalid stock configuration.`,
        );
      }

      if (canonical.stock <= 0) {
        throw new Error(
          `"${productName}" is currently out of stock.`,
        );
      }

      if (canonical.stock < quantity) {
        throw new Error(
          `Insufficient stock for "${productName}". Available: ${canonical.stock}, requested: ${quantity}.`,
        );
      }

      // Also ensure the discounted amount can be represented safely.
      const discountedPrice = getDiscountedPrice(price, discount);
      const unitAmount = Math.round(discountedPrice * 100);

      if (
        !Number.isSafeInteger(unitAmount) ||
        unitAmount < 0
      ) {
        throw new Error(
          `"${productName}" has an invalid checkout price.`,
        );
      }
    }

    const user = await currentUser();

    if (!user) {
      throw new Error("Unable to verify your customer account.");
    }

    const customerEmail =
      user.emailAddresses?.[0]?.emailAddress;

    if (!customerEmail) {
      throw new Error(
        "A valid email address is required to complete checkout.",
      );
    }

    const customerName = user.fullName || "Customer";

    // Generate the order number on the server.
    const orderNumber = randomUUID();

    // Look up an existing Stripe customer.
    const customers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    });

    const customerId =
      customers.data.length > 0
        ? customers.data[0].id
        : "";

    // Build delivery address metadata from the verified Sanity record.
    const addressMetadata = JSON.stringify({
      label: verifiedAddress.label || "",
      name: verifiedAddress.fullName || "",
      address: verifiedAddress.street || "",
      city: verifiedAddress.city || "",
      state: verifiedAddress.state || "",
      zip: verifiedAddress.zip || "",
    });

    if (addressMetadata.length > 500) {
      throw new Error(
        "The selected delivery address is too long to process. Please review your saved address.",
      );
    }

    // Build Stripe line items using current Sanity prices and discounts.
    // Duplicate product IDs are combined into one line item.
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
      [...requestedQuantities.entries()].map(
        ([productId, quantity]) => {
          const canonical = canonicalMap.get(productId)!;

          const price = getValidPrice(canonical.price);
          const discount = getValidDiscount(canonical.discount);

          const discountedPrice = getDiscountedPrice(
            price,
            discount,
          );

          const unitAmount = Math.round(discountedPrice * 100);

          let imageUrl: string | undefined;

          if (
            Array.isArray(canonical.image) &&
            canonical.image.length > 0
          ) {
            try {
              imageUrl = urlFor(
                canonical.image[0] as Parameters<typeof urlFor>[0],
              ).url();
            } catch {
              imageUrl = undefined;
            }
          }

          return {
            price_data: {
              currency: "NGN",
              unit_amount: unitAmount,
              product_data: {
                name: canonical.title || "Unknown Product",
                description: canonical.description,
                metadata: {
                  id: canonical._id,
                },
                images: imageUrl ? [imageUrl] : undefined,
              },
            },
            quantity,
          };
        },
      );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!baseUrl) {
      throw new Error(
        "The checkout base URL is not configured.",
      );
    }

    const sessionPayload: Stripe.Checkout.SessionCreateParams = {
      metadata: {
        orderNumber,
        customerName,
        customerEmail,
        clerkUserId: userId,
        address: addressMetadata,
        addressId: verifiedAddress._id,
      },

      mode: "payment",
      allow_promotion_codes: true,
      payment_method_types: ["card"],

      invoice_creation: {
        enabled: true,
      },

      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${encodeURIComponent(orderNumber)}`,
      cancel_url: `${baseUrl}/cart`,

      line_items,
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

    return session.url;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}
