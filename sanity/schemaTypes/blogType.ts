import { defineField, defineType } from "sanity";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";

export const blogType = defineType({
  name: "blog",
  title: "Blog",
  type: "document",
  icon: DocumentTextIcon,

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
      name: "excerpt",
      title: "Excerpt",
      type: "text",
    }),

    defineField({
      name: "image",
      title: "Featured Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "blogCategory" }],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),

    defineField({
      name: "body",
      title: "Body",
      type: "blockContent",
      validation: (Rule) => Rule.required(),
    }),
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "category.title",
      media: "image",
    },
  },
});