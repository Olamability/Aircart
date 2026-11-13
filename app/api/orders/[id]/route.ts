
import { NextRequest, NextResponse } from "next/server";

import { authenticateMobileRequest } from "@/lib/mobileAuth";
import { getCorsHeaders } from "@/lib/cors";
import { backendClient } from "@/sanity/lib/backendClient";

interface RouteContext {
    params: Promise<{ id: string }>;
}

const ORDER_QUERY = `*[
    _type == "order" &&
    _id == $orderId &&
    clerkUserId == $userId
][0] {
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
    statusHistory[] {
        status,
        note,
        changedBy,
        changedAt
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

export async function GET(
    request: NextRequest,
    context: RouteContext,
) {
    const headers = getCorsHeaders(request);

    try {
        const authenticatedUser =
            await authenticateMobileRequest(request);

        if (!authenticatedUser) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers },
            );
        }

        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                { error: "Order ID is required" },
                { status: 400, headers },
            );
        }

        const order = await backendClient.fetch(
            ORDER_QUERY,
            {
                orderId: id,
                userId: authenticatedUser.userId,
            },
        );

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404, headers },
            );
        }

        return NextResponse.json(
            { order },
            { status: 200, headers },
        );
    } catch (error) {
        console.error("Failed to retrieve order:", error);

        return NextResponse.json(
            { error: "Unable to retrieve order" },
            { status: 500, headers },
        );
    }
}
