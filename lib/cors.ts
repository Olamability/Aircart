
import { NextRequest } from "next/server";

export function getCorsHeaders(request: NextRequest): Headers {
    const headers = new Headers();

    const origin = request.headers.get("origin");

    const allowedOrigins = [
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        process.env.EXPO_WEB_ORIGIN,
    ].filter((value): value is string => Boolean(value));

    if (origin && allowedOrigins.includes(origin)) {
        headers.set("Access-Control-Allow-Origin", origin);
    }

    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set(
        "Access-Control-Allow-Headers",
        "Authorization, Content-Type, Accept",
    );
    headers.set("Access-Control-Max-Age", "86400");
    headers.set("Vary", "Origin");

    return headers;
}
