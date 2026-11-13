
import "server-only";

import { verifyToken } from "@clerk/backend";
import { NextRequest } from "next/server";

export async function authenticateMobileRequest(
    request: NextRequest,
): Promise<{ userId: string } | null> {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
        return null;
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
        return null;
    }

    try {
        const payload = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
        });

        if (typeof payload.sub !== "string" || !payload.sub) {
            return null;
        }

        return {
            userId: payload.sub,
        };
    } catch (error) {
        console.error("Mobile authentication failed:", error);
        return null;
    }
}
