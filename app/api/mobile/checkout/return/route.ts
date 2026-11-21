
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const sessionId = request.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
        return NextResponse.redirect(
            new URL("spaazr://checkout/success?status=missing_session"),
        );
    }

    const appReturnUrl = new URL(
        "spaazr://checkout/success",
    );

    appReturnUrl.searchParams.set("session_id", sessionId);

    return NextResponse.redirect(appReturnUrl);
}
