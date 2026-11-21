
"use server";

import { auth, currentUser } from "@clerk/nextjs/server";

import { createCheckoutForCustomer } from "@/app/checkout/checkoutService";
import { CartItem } from "@/store";

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

export async function createCheckoutSession(
  items: GroupedCartItems[],
  metadata: Metadata,
): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to checkout.");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const user = await currentUser();

  if (!user) {
    throw new Error("Unable to verify your customer account.");
  }

  const customerEmail = user.emailAddresses?.find(
    (email) => email.id === user.primaryEmailAddressId,
  )?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress;

  if (!customerEmail) {
    throw new Error(
      "A valid email address is required to complete checkout.",
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    throw new Error("The checkout base URL is not configured.");
  }

  const session = await createCheckoutForCustomer({
    userId,
    customerName: user.fullName || "Customer",
    customerEmail,
    addressId: metadata?.addressId,
    items: items.map((item) => ({
      productId: item?.product?._id,
      quantity: item?.quantity,
    })),
    successUrl:
      `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}` +
      "&orderNumber=__ORDER_NUMBER__",
    cancelUrl: `${baseUrl}/cart`,
  });

  return session.url;
}
