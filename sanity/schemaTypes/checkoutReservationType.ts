
import { defineField, defineType } from "sanity";

export const checkoutReservationType = defineType({
    name: "checkoutReservation",
    title: "Checkout Reservation",
    type: "document",
    fields: [
        defineField({
            name: "reservationId",
            title: "Reservation ID",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "stripeCheckoutSessionId",
            title: "Stripe Checkout Session ID",
            type: "string",
        }),
        defineField({
            name: "stripePaymentIntentId",
            title: "Stripe Payment Intent ID",
            type: "string",
        }),
        defineField({
            name: "orderNumber",
            title: "Order Number",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "clerkUserId",
            title: "Clerk User ID",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "customerName",
            title: "Customer Name",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "customerEmail",
            title: "Customer Email",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "address",
            title: "Delivery Address",
            type: "object",
            fields: [
                { name: "name", type: "string" },
                { name: "address", type: "string" },
                { name: "city", type: "string" },
                { name: "state", type: "string" },
                { name: "zip", type: "string" },
            ],
        }),
        defineField({
            name: "items",
            title: "Reserved Products",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        {
                            name: "product",
                            type: "reference",
                            to: [{ type: "product" }],
                            validation: (Rule) => Rule.required(),
                        },
                        {
                            name: "quantity",
                            type: "number",
                            validation: (Rule) => Rule.required().integer().min(1),
                        },
                        {
                            name: "unitAmount",
                            title: "Unit Amount (Kobo)",
                            type: "number",
                            validation: (Rule) => Rule.required().integer().min(0),
                        },
                    ],
                    preview: {
                        select: {
                            title: "product.title",
                            quantity: "quantity",
                        },
                        prepare({ title, quantity }) {
                            return {
                                title: title || "Reserved product",
                                subtitle: `Quantity: ${quantity ?? 0}`,
                            };
                        },
                    },
                },
            ],
            validation: (Rule) => Rule.required().min(1),
        }),
        defineField({
            name: "status",
            title: "Reservation Status",
            type: "string",
            options: {
                list: [
                    { title: "Active", value: "active" },
                    { title: "Consumed", value: "consumed" },
                    { title: "Released", value: "released" },
                    { title: "Reconciliation Required", value: "reconciliation_required" },
                ],
            },
            initialValue: "active",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "createdAt",
            title: "Created At",
            type: "datetime",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "expiresAt",
            title: "Expires At",
            type: "datetime",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "paidAt",
            title: "Paid At",
            type: "datetime",
        }),
        defineField({
            name: "releasedAt",
            title: "Released At",
            type: "datetime",
        }),
    ],
    preview: {
        select: {
            title: "orderNumber",
            subtitle: "status",
        },
        prepare({ title, subtitle }) {
            return {
                title: title || "Checkout reservation",
                subtitle: `Status: ${subtitle || "unknown"}`,
            };
        },
    },
});
