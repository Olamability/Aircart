import { defineField, defineType } from "sanity";
import { TagIcon } from "@sanity/icons/Tag";

export const brandType = defineType({
  name: "brand",
  title: "Brand",
  type: "document",
  icon: TagIcon,

  fields: [
    defineField({
      name: "title",
      title: "Brand Name",
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
      name: "description",
      title: "Description",
      type: "text",
    }),

    defineField({
      name: "logo",
      title: "Brand Logo",
      type: "image",
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: "featured",
      title: "Featured Brand",
      type: "boolean",
      initialValue: false,
    }),
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "description",
      media: "logo",
    },
  },
});