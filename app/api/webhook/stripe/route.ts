
import stripe from "@/lib/stripe";
import {
  createOrderInSanity,
} from "@/app/checkout/orderService";
import {
  releaseCheckoutReservation,
} from "@/app/checkout/reservationService";

import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

async function processPaidSession(
  session: Stripe.Checkout.Session,
  eventId: string,
) {
  if (session.payment_status !== "paid") {
    return null;
  }

  let invoice: Stripe.Invoice | null = null;

  if (session.invoice) {
    const invoiceId =
      typeof session.invoice === "string"
        ? session.invoice
        : session.invoice.id;

    invoice = await stripe.invoices.retrieve(invoiceId);
  }

  return createOrderInSanity(session, eventId, invoice);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  if (!webhookSecret) {
    console.error(
      "STRIPE_WEBHOOK_SECRET is not configured.",
    );

    return NextResponse.json(
      { error: "Webhook configuration error." },
      { status: 500 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
    );
  } catch (error) {
    console.error(
      "Stripe webhook signature verification failed:",
      error,
    );

    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 },
    );
  }

  const supportedEvents = [
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.expired",
  ];

  if (!supportedEvents.includes(event.type)) {
    return NextResponse.json({ received: true });
  }

  const session =
    event.data.object as Stripe.Checkout.Session;

  try {
    if (event.type === "checkout.session.expired") {
      if (session.payment_status === "paid") {
        const order = await processPaidSession(
          session,
          event.id,
        );

        return NextResponse.json({
          received: true,
          orderId: order?._id,
        });
      }

      const reservationId =
        session.metadata?.reservationId;

      // Older sessions created before reservations were deployed
      // do not have reservation metadata.
      if (!reservationId) {
        console.warn(
          `Expired legacy checkout session ${session.id} has no reservation.`,
        );

        return NextResponse.json({
          received: true,
          message: "No reservation was associated with this session.",
        });
      }

      const result = await releaseCheckoutReservation(
        reservationId,
        session.id,
      );

      console.log(
        `Expired checkout session ${session.id}: ${result.reason}.`,
      );

      return NextResponse.json({
        received: true,
        reservationReleased: result.released,
        reason: result.reason,
      });
    }

    if (session.payment_status !== "paid") {
      console.warn(
        `Checkout session ${session.id} completed without a paid status.`,
      );

      return NextResponse.json({
        received: true,
        message:
          "Payment is not complete. No order was created.",
      });
    }

    const order = await processPaidSession(
      session,
      event.id,
    );

    console.log(
      `Stripe event ${event.id} processed for session ${session.id}.`,
    );

    return NextResponse.json({
      received: true,
      orderId: order?._id,
    });
  } catch (error) {
    console.error(
      `Failed to process Stripe event ${event.id}:`,
      error,
    );

    return NextResponse.json(
      {
        error:
          "Checkout processing failed. Stripe can retry this event.",
      },
      { status: 500 },
    );
  }
}
