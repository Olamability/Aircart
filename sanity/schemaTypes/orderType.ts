import { defineField, defineType } from "sanity";
import { BasketIcon } from "@sanity/icons/Basket";

export const orderType = defineType({
  name: "order",
  title: "Order",
  type: "document",
  icon: BasketIcon,

  fields: [
    defineField({
      name: "orderNumber",
      title: "Order Number",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "stripeCheckoutSessionId",
      title: "Stripe Checkout Session ID",
      type: "string",
    }),

    defineField({
      name: "stripeCustomerId",
      title: "Stripe Customer ID",
      type: "string",
    }),

    defineField({
      name: "stripePaymentIntentId",
      title: "Stripe Payment Intent ID",
      type: "string",
    }),

    defineField({
      name: "paymentReference",
      title: "Payment Reference",
      type: "string",
    }),

    defineField({
      name: "paymentStatus",
      title: "Payment Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Paid", value: "paid" },
          { title: "Failed", value: "failed" },
          { title: "Refunded", value: "refunded" },
        ],
      },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "invoice",
      title: "Invoice",
      type: "object",
      fields: [
        defineField({
          name: "id",
          title: "Invoice ID",
          type: "string",
        }),
        defineField({
          name: "number",
          title: "Invoice Number",
          type: "string",
        }),
        defineField({
          name: "hosted_invoice_url",
          title: "Hosted Invoice URL",
          type: "url",
        }),
      ],
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
      name: "products",
      title: "Order Products",
      type: "array",
      validation: (Rule) => Rule.min(1),

      of: [
        {
          type: "object",

          fields: [
            defineField({
              name: "product",
              title: "Product Purchased",
              type: "reference",
              to: [{ type: "product" }],
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: "quantity",
              title: "Quantity Purchased",
              type: "number",
              validation: (Rule) => Rule.required().min(1),
            }),

            defineField({
              name: "price",
              title: "Price At Purchase",
              type: "number",
              validation: (Rule) => Rule.required().min(0),
            }),
          ],

          preview: {
            select: {
              title: "product.title",
              quantity: "quantity",
              price: "price",
              image: "product.image",
            },

            prepare(select) {
              return {
                title: `${select.title || "Product"} x ${select.quantity || 0}`,

                subtitle:
                  typeof select.price === "number"
                    ? `₦${select.price.toLocaleString()} × ${
                        select.quantity || 0
                      }`
                    : `Quantity: ${select.quantity || 0}`,

                media: select.image,
              };
            },
          },
        },
      ],
    }),

    defineField({
      name: "totalPrice",
      title: "Total Price",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),

    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "amountDiscount",
      title: "Amount Discount",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),

    defineField({
      name: "address",
      title: "Shipping Address",
      type: "object",

      fields: [
        defineField({
          name: "name",
          title: "Recipient Name",
          type: "string",
        }),

        defineField({
          name: "address",
          title: "Address",
          type: "string",
        }),

        defineField({
          name: "city",
          title: "City",
          type: "string",
        }),

        defineField({
          name: "state",
          title: "State",
          type: "string",
        }),

        defineField({
          name: "zip",
          title: "ZIP Code",
          type: "string",
        }),
      ],
    }),

    defineField({
      name: "status",
      title: "Order Status",
      type: "string",

      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Processing", value: "processing" },
          { title: "Shipped", value: "shipped" },
          { title: "Out for Delivery", value: "out_for_delivery" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },

      initialValue: "pending",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "orderDate",
      title: "Order Date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
  ],

  preview: {
    select: {
      name: "customerName",
      amount: "totalPrice",
      currency: "currency",
      orderId: "orderNumber",
      email: "customerEmail",
      status: "status",
      paymentStatus: "paymentStatus",
    },

    prepare(select) {
      const orderNumber = select.orderId || "";

      const orderIdSnippet =
        orderNumber.length > 10
          ? `${orderNumber.slice(0, 5)}....${orderNumber.slice(-5)}`
          : orderNumber;

      return {
        title: `${select.name || "Customer"} (${orderIdSnippet})`,

        subtitle: `${select.amount || 0} ${
          select.currency || ""
        } • ${select.email || ""} • ${
          select.status || "pending"
        } • Payment: ${select.paymentStatus || "pending"}`,

        media: BasketIcon,
      };
    },
  },
});
