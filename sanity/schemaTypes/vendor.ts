
import { defineField, defineType } from "sanity";

export const vendorType = defineType({
  name: "vendor",
  title: "Vendor",
  type: "document",

  fields: [
    // Store identity
    defineField({
      name: "businessName",
      title: "Store Name",
      type: "string",
      validation: (Rule) => Rule.required().max(100),
    }),

    defineField({
      name: "slug",
      title: "Store URL",
      type: "slug",
      options: {
        source: "businessName",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "logo",
      title: "Store Logo",
      type: "image",
      options: { hotspot: true },
    }),

    defineField({
      name: "description",
      title: "Store Description",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.max(1000),
    }),

    // Public store information
    defineField({
      name: "storeEmail",
      title: "Store Contact Email",
      type: "string",
    }),

    defineField({
      name: "phone",
      title: "Store Phone Number",
      type: "string",
    }),

    defineField({
      name: "storeCategory",
      title: "Store Category",
      type: "string",
    }),

    defineField({
      name: "storeSubcategory",
      title: "Store Subcategory",
      type: "string",
    }),

    defineField({
      name: "storeAddress",
      title: "Store Address",
      type: "string",
    }),

    defineField({
      name: "storeCity",
      title: "Store City",
      type: "string",
    }),

    defineField({
      name: "storeState",
      title: "Store State",
      type: "string",
    }),

    defineField({
      name: "storeLga",
      title: "Store Local Government Area",
      type: "string",
    }),

    // Private business information
    defineField({
      name: "registeredBusinessName",
      title: "Registered Business Name",
      type: "string",
    }),

    defineField({
      name: "businessType",
      title: "Business Type",
      type: "string",
      options: {
        list: [
          { title: "Sole Proprietorship", value: "sole_proprietorship" },
          { title: "Partnership", value: "partnership" },
          { title: "Limited Liability Company", value: "limited_liability_company" },
          { title: "Other", value: "other" },
        ],
      },
    }),

    defineField({
      name: "cacRegistrationNumber",
      title: "CAC Registration Number",
      type: "string",
    }),

    defineField({
      name: "taxIdentificationNumber",
      title: "Tax Identification Number (TIN)",
      type: "string",
    }),

    defineField({
      name: "registeredBusinessAddress",
      title: "Registered Business Address",
      type: "string",
    }),

    defineField({
      name: "registeredBusinessCity",
      title: "Registered Business City",
      type: "string",
    }),

    defineField({
      name: "registeredBusinessState",
      title: "Registered Business State",
      type: "string",
    }),

    defineField({
      name: "registeredBusinessLga",
      title: "Registered Business LGA",
      type: "string",
    }),

    // Account ownership and administrative controls
    defineField({
      name: "clerkUserId",
      title: "Clerk User ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "email",
      title: "Account Email",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "status",
      title: "Vendor Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Approved", value: "approved" },
          { title: "Rejected", value: "rejected" },
          { title: "Suspended", value: "suspended" },
        ],
      },
      initialValue: "pending",
    }),

    // Approval workflow fields
    defineField({
      name: "rejectionReason",
      title: "Rejection Reason",
      type: "text",
      rows: 3,
      description: "The reason this application was rejected (visible to the vendor).",
    }),

    defineField({
      name: "reviewerNote",
      title: "Reviewer Note",
      type: "text",
      rows: 3,
      description: "Note sent to the vendor when changes are requested.",
    }),

    defineField({
      name: "reviewedAt",
      title: "Last Reviewed At",
      type: "datetime",
    }),

    defineField({
      name: "reviewedBy",
      title: "Last Reviewed By",
      type: "string",
      description: "Email or ID of the reviewer who made the last decision.",
    }),

    defineField({
      name: "approvalHistory",
      title: "Approval History",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "action", title: "Action", type: "string" }),
            defineField({ name: "reason", title: "Reason / Note", type: "text" }),
            defineField({ name: "reviewedBy", title: "Reviewed By", type: "string" }),
            defineField({ name: "reviewedAt", title: "Reviewed At", type: "datetime" }),
          ],
          preview: {
            select: { title: "action", subtitle: "reviewedBy" },
          },
        },
      ],
    }),

    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),

    defineField({
      name: "updatedAt",
      title: "Last Updated",
      type: "datetime",
    }),
  ],

  preview: {
    select: {
      title: "businessName",
      subtitle: "email",
      media: "logo",
    },
  },
});
