import { defineField, defineType } from "sanity";
import { TagIcon } from "@sanity/icons/Tag";

export const blogCategoryType = defineType({
  name: "blogCategory",
  title: "Blog Category",
  type: "document",
  icon: TagIcon,

  fields: [
    defineField({
      name: "title",
      title: "Title",
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
      name: "image",
      title: "Category Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
  ],

  preview: {
    select: {
      title: "title",
      media: "image",
    },
  },
});