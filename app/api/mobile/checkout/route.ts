
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { createCheckoutForCustomer } from "@/app/checkout/checkoutService";
import { authenticateMobileRequest } from "@/lib/mobileAuth";
import { getCorsHeaders } from "@/lib/cors";

interface MobileCheckoutBody {
    items?: {
        productId?: unknown;
        quantity?: unknown;
    }[];
    addressId?: unknown;
}

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(request),
    });
}

export async function POST(request: NextRequest) {
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

        let body: MobileCheckoutBody;

        try {
            body = (await request.json()) as MobileCheckoutBody;
        } catch {
            return NextResponse.json(
                { error: "Invalid checkout request body." },
                { status: 400, headers },
            );
        }

        if (
            !Array.isArray(body.items) ||
            body.items.length === 0 ||
            typeof body.addressId !== "string" ||
            !body.addressId.trim()
        ) {
            return NextResponse.json(
                {
                    error:
                        "Checkout requires cart items and a saved delivery address.",
                },
                { status: 400, headers },
            );
        }

        const items: {
            productId: string;
            quantity: number;
        }[] = [];

        for (const item of body.items) {
            if (
                typeof item?.productId !== "string" ||
                !item.productId.trim() ||
                !Number.isSafeInteger(item.quantity) ||
                (item.quantity as number) < 1
            ) {
                return NextResponse.json(
                    { error: "One or more cart items are invalid." },
                    { status: 400, headers },
                );
            }

            items.push({
                productId: item.productId.trim(),
                quantity: item.quantity as number,
            });
        }

        const clerk = await clerkClient();
        const user = await clerk.users.getUser(
            authenticatedUser.userId,
        );

        const primaryEmail = user.emailAddresses.find(
            (email) => email.id === user.primaryEmailAddressId,
        );

        const customerEmail =
            primaryEmail?.emailAddress ??
            user.emailAddresses[0]?.emailAddress;

        if (!customerEmail) {
            return NextResponse.json(
                {
                    error:
                        "A verified email address is required to complete checkout.",
                },
                { status: 422, headers },
            );
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

        if (!baseUrl) {
            throw new Error(
                "The checkout base URL is not configured.",
            );
        }

        const customerName =
            [user.firstName, user.lastName]
                .filter(Boolean)
                .join(" ") || "Customer";

        const session = await createCheckoutForCustomer({
            userId: authenticatedUser.userId,
            customerName,
            customerEmail,
            addressId: body.addressId,
            items,
            successUrl:
                `${baseUrl}/api/mobile/checkout/return` +
                "?session_id={CHECKOUT_SESSION_ID}",
            cancelUrl:
                `${baseUrl}/api/mobile/checkout/cancel`,
        });

        return NextResponse.json(
            {
                checkoutUrl: session.url,
                sessionId: session.sessionId,
                orderNumber: session.orderNumber,
            },
            { status: 201, headers },
        );
    } catch (error) {
        console.error(
            "Mobile checkout session creation failed:",
            error,
        );

        const message =
            error instanceof Error
                ? error.message
                : "Unable to start checkout.";

        return NextResponse.json(
            { error: message },
            { status: 400, headers },
        );
    }
}
