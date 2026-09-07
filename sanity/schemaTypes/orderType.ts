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

    {
      name: "invoice",
      type: "object",
      fields: [
        { name: "id", type: "string" },
        { name: "number", type: "string" },
        { name: "hosted_invoice_url", type: "url" },
      ],
    },
    
defineField({
      name: "stripeCheckoutSessionId",
      title: "Strip Checkout Session ID",
      type: "string",
      
    }),

    defineField({
      name: "stripeCCustomerId",
      title: "Strip Customer ID",
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
      name: "striptPaymentIntentId",
      title: "Strip Payment Intent ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

        
    defineField({
      name: "items",
      title: "Order Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "product",
              title: "Product Purchased",
              type: "reference",
              to: [{ type: "product" }],
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
              subtitle: "quantity",
              image: "product.image",
              price: "product.prie",
              currency: "product.currency",
            },
            prepare(select) {
              return {
                title: `${select.product} x ${select.quantity}`,
                subtitle: `${select.price} x ${select.quantity}`,
                image: select.image,
              }
            }
          },
        },
      ],
    }),

    defineField({
      name: "totalprice",
      title: "Total Price",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    
    defineField({
      name: "currency", 
      title: "Currenccy", 
      type: "string", 
      validation: (Rule) => Rule.required(),
    }),

      defineField({
      name: "amountDiscount", 
      title: "Amount Discount", 
      type: "number", 
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "address", 
      title: "Shipping Address", 
      type: "object", 
      fields: [
        defineField({ name: "state", title: "state", type: "string", }),
        defineField({ name: "zip", title: "ZIP Code", type: "string", }),
        defineField({ name: "city", title: "City", type: "string", }),
        defineField({ name: "address", title: "Address", type: "string", }),
        defineField({ name: "name", title: "Name", type: "string", }),

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
          { title: "Paid", value: "paid" },
          { title: "Shipped", value: "shipped" },
          { title: "Out for Delivery", value: "out_for_delivery" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "pending",
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
    }),

    defineField({
      name: "paymentReference",
      title: "Payment Reference",
      type: "string",
    }),

    defineField({
      name: "shippingAddress",
      title: "Shipping Address",
      type: "reference",
      to: [{ type: "address" }],
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
      initialValue: () => new Date().toISOString(),
    }),
  ],

  preview: {
    select: {
      name: "customerName",
      amount: "totalPrice",
      currency: "currency",
      orderId: "orderNumber",
      email: "email",
      subtitle: "status",
    },
    prepare(select) {
      const orderIdSnippet = `${select.orderId.slice( 0, 5)}....${select.orderId.slice()}`
      return {
        title: `${select.name} (${orderIdSnippet})`,
        subtitle: `${select.amount} (${select.currency}, ${select.email})`,
        media: BasketIcon,
      }
    }
  },
});