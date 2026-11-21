
import { NextResponse } from "next/server";

export async function GET() {
    const returnUrl = new URL(
        "spaazr://checkout/success",
    );

    returnUrl.searchParams.set("status", "cancelled");

    return NextResponse.redirect(returnUrl);
}
