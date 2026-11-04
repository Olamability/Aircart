
import { defineField, defineType } from "sanity";

export const disputeType = defineType({
  name: "dispute",
  title: "Dispute & Claim",
  type: "document",

  fields: [
    defineField({
      name: "subject",
      title: "Subject / Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "order",
      title: "Related Order",
      type: "reference",
      to: [{ type: "order" }],
    }),

    defineField({
      name: "claimantType",
      title: "Claimant Type",
      type: "string",
      options: {
        list: [
          { title: "Customer", value: "customer" },
          { title: "Vendor", value: "vendor" },
        ],
      },
      initialValue: "customer",
    }),

    defineField({
      name: "claimantName",
      title: "Claimant Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "claimantEmail",
      title: "Claimant Email",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "reason",
      title: "Dispute Reason",
      type: "string",
      options: {
        list: [
          { title: "Non-Delivery / Transit Loss", value: "non_delivery" },
          { title: "Damaged or Defective Item", value: "damaged_item" },
          { title: "Wrong Item Received", value: "wrong_item" },
          { title: "Refund / Return Request", value: "refund_request" },
          { title: "Vendor Conduct / Policy Violation", value: "merchant_conduct" },
          { title: "Other / General Complaint", value: "other" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "priority",
      title: "Priority Level",
      type: "string",
      options: {
        list: [
          { title: "Low", value: "low" },
          { title: "Medium", value: "medium" },
          { title: "High", value: "high" },
          { title: "Urgent", value: "urgent" },
        ],
      },
      initialValue: "medium",
    }),

    defineField({
      name: "status",
      title: "Dispute Status",
      type: "string",
      options: {
        list: [
          { title: "Open / Awaiting Mediation", value: "open" },
          { title: "Under Investigation", value: "investigating" },
          { title: "Escalated", value: "escalated" },
          { title: "Resolved", value: "resolved" },
          { title: "Closed", value: "closed" },
        ],
      },
      initialValue: "open",
    }),

    defineField({
      name: "description",
      title: "Dispute Details / Description",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "resolutionNote",
      title: "Platform Resolution / Finding",
      type: "text",
    }),

    defineField({
      name: "resolvedBy",
      title: "Resolved By (Admin Email)",
      type: "string",
    }),

    defineField({
      name: "resolvedAt",
      title: "Resolved At",
      type: "datetime",
    }),

    defineField({
      name: "createdAt",
      title: "Logged At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
  ],

  preview: {
    select: {
      title: "subject",
      claimant: "claimantName",
      status: "status",
      reason: "reason",
    },
    prepare(selection) {
      const { title, claimant, status, reason } = selection;

      return {
        title: title || "Dispute",
        subtitle: `${claimant || "Buyer"} • ${status || "open"} • ${reason || "general"}`,
      };
    },
  },
});
