
import { defineField, defineType } from "sanity";


export const reviewType = defineType({
    name: "review",
    title: "Product Review",
    type: "document",


    fields: [
        defineField({
            name: "product",
            title: "Product",
            type: "reference",
            to: [{ type: "product" }],
            validation: (Rule) => Rule.required(),
        }),

        defineField({
            name: "order",
            title: "Verified Order",
            type: "reference",
            to: [{ type: "order" }],
            validation: (Rule) => Rule.required(),
        }),

        defineField({
            name: "clerkUserId",
            title: "Customer Clerk ID",
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
            name: "rating",
            title: "Rating",
            type: "number",
            validation: (Rule) => Rule.required().integer().min(1).max(5),
        }),

        defineField({
            name: "comment",
            title: "Review",
            type: "text",
            rows: 4,
            validation: (Rule) => Rule.max(1000),
        }),

        defineField({
            name: "status",
            title: "Review Status",
            type: "string",
            options: {
                list: [
                    { title: "Pending", value: "pending" },
                    { title: "Approved", value: "approved" },
                    { title: "Rejected", value: "rejected" },
                ],
            },
            initialValue: "pending",
            validation: (Rule) => Rule.required(),
        }),

        defineField({
            name: "createdAt",
            title: "Submitted At",
            type: "datetime",
            validation: (Rule) => Rule.required(),
        }),
    ],

    preview: {
        select: {
            title: "customerName",
            rating: "rating",
            product: "product.title",
            status: "status",
        },

        prepare({ title, rating, product, status }) {
            return {
                title: `${title || "Customer"} — ${rating || 0}/5`,
                subtitle: `${product || "Product"} • ${status || "pending"}`,
            };
        },
    },
});