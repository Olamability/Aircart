
import { NextRequest, NextResponse } from "next/server";

import stripe from "@/lib/stripe";
import { authenticateMobileRequest } from "@/lib/mobileAuth";
import { getCorsHeaders } from "@/lib/cors";
import { backendClient } from "@/sanity/lib/backendClient";

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(request),
    });
}

export async function GET(request: NextRequest) {
    const headers = getCorsHeaders(request);

    try {
        const authenticatedUser =
            await authenticateMobileRequest(request);

        if (!authenticatedUser) {
            return NextResponse.json(
                {
                    error: "Your session has expired. Please sign in again.",
                },
                { status: 401, headers },
            );
        }

        const sessionId =
            request.nextUrl.searchParams.get("session_id");

        if (!sessionId || !sessionId.startsWith("cs_")) {
            return NextResponse.json(
                {
                    error: "A valid Checkout Session ID is required.",
                },
                { status: 400, headers },
            );
        }

        const session =
            await stripe.checkout.sessions.retrieve(sessionId);

        // A customer must never be able to verify another customer's session.
        if (
            session.metadata?.clerkUserId !==
            authenticatedUser.userId
        ) {
            return NextResponse.json(
                {
                    error: "This checkout session does not belong to you.",
                },
                { status: 403, headers },
            );
        }

        // Stripe has not confirmed payment yet.
        if (session.payment_status !== "paid") {
            const isCheckoutCompleted =
                session.status === "complete";

            return NextResponse.json(
                {
                    status: isCheckoutCompleted
                        ? "processing"
                        : "unpaid",
                    paid: false,
                    order: null,
                },
                { status: 200, headers },
            );
        }

        // Payment is confirmed. The webhook remains responsible
        // for creating and persisting the Sanity order.
        const order = await backendClient.fetch(
            `*[
                _type == "order" &&
                stripeCheckoutSessionId == $sessionId &&
                clerkUserId == $userId
            ][0] {
                _id,
                orderNumber,
                status,
                paymentStatus,
                totalPrice,
                currency,
                orderDate
            }`,
            {
                sessionId,
                userId: authenticatedUser.userId,
            },
        );

        // Stripe has confirmed payment, but the webhook may
        // not have finished creating the Sanity order yet.
        if (!order) {
            return NextResponse.json(
                {
                    status: "processing",
                    paid: true,
                    order: null,
                },
                { status: 200, headers },
            );
        }

        return NextResponse.json(
            {
                status: "paid",
                paid: true,
                order,
            },
            { status: 200, headers },
        );
    } catch (error) {
        console.error(
            "Mobile checkout payment verification failed:",
            error,
        );

        return NextResponse.json(
            {
                error: "Unable to verify this payment right now.",
            },
            { status: 500, headers },
        );
    }
}
