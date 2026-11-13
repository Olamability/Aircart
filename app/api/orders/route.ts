
import { NextRequest, NextResponse } from "next/server";

import { authenticateMobileRequest } from "@/lib/mobileAuth";
import { getCorsHeaders } from "@/lib/cors";
import { backendClient } from "@/sanity/lib/backendClient";

const ORDERS_QUERY = `*[
  _type == "order" &&
  clerkUserId == $userId
] | order(orderDate desc) {
  _id,
  orderNumber,
  customerName,
  customerEmail,
  paymentStatus,
  status,
  orderDate,
  createdAt,
  totalPrice,
  currency,
  amountDiscount,
  address {
    name,
    address,
    city,
    state,
    zip
  },
  products[] {
    _key,
    quantity,
    price,
    "product": product-> {
      _id,
      title,
      image,
      "vendorName": vendor->businessName
    }
  }
}`;

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

export async function GET(request: NextRequest) {
  const headers = getCorsHeaders(request);

  try {
    // Verify the Clerk-issued mobile Bearer token.
    const authenticatedUser =
      await authenticateMobileRequest(request);

    if (!authenticatedUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers },
      );
    }

    // Only retrieve orders belonging to the authenticated user.
    const orders = await backendClient.fetch(
      ORDERS_QUERY,
      { userId: authenticatedUser.userId },
    );

    return NextResponse.json(
      { orders },
      { status: 200, headers },
    );
  } catch (error) {
    console.error("Failed to retrieve customer orders:", error);

    return NextResponse.json(
      { error: "Unable to retrieve orders" },
      { status: 500, headers },
    );
  }
}
