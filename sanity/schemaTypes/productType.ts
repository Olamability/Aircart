import { defineField, defineType } from "sanity";
import { TrolleyIcon } from "@sanity/icons/Trolley";


export const productType = defineType({

  name: "product",
  title: "Product",
  type: "document",
  icon: TrolleyIcon,
  

  fields: [
    defineField({
      name: "title",
      title: "Product Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "image",
      title: "Product Image",
      type: "array",
      of: [{type: "image", options: {hotspot: true}}],
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "string",
    }),

    defineField({
      name: "price",
      title: "Price",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),

    defineField({
      name: "discount",
      title: "Discount (%)",
      type: "number",
      validation: (Rule) => Rule.min(0).max(100),
    }),

       defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [
        { 
        type: "reference", to: [{ type: "category" }] }],
    }),

     defineField({
      name: "stock",
      title: "Stock Quantity",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),

    defineField({
      name: "brand",
      title: "Brand",
      type: "reference",
      to: [{ type: "brand" }],
    }),

    defineField({
      name: "status",
      title: "Produt Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Hot", value: "hot" },
          { title: "Sale", value: "sale" },
          { title: "Available", value: "available" },


        ],
      },
    }),

      defineField({
      name: "images",
      title: "Additional Images",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
    }),

    defineField({
      name: "isNew",
      title: "New Product",
      type: "boolean",
      initialValue: false,
    }),

    

    defineField({
      name: "variant",
      title: "Produt Type",
      type: "string",
      options: {
        list: [
          { title: "Gadget", value: "gadget" },
          { title: "Appliances", value: "appliances" },
          { title: "Refrigerator", value: "refrigerator" },
          { title: "Others", value: "others"},
          {title: "Food & Beverages", value: "food & beverages" },

        ],
      },
    }),

    defineField({
      name: "isfeatured",
      title: "Featured Product",
      type: "boolean",
      description: "Toggle to feature on or off",
      initialValue: false,
    }),
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "price",
      media: "image",
    },
    prepare(selection) {
      const { title, subtitle, media} = selection;
      const image = media && media[0];
      return {
        title: title,
        subtitle: subtitle ? `₦${subtitle}` : "",
        media: image,
      }
    }
  },
});