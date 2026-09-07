import { defineArrayMember, defineField, defineType } from "sanity";
import { UserIcon } from "@sanity/icons/User";

export const authorType = defineType({
  name: "author",
  title: "Author",
  type: "document",
  icon: UserIcon,

  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      
    }),

    defineField({
      name: "image",
      title: "Profile Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: "bio",
      title: "Biography",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [],
        }),
      ],
    }),
  
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),

    defineField({
      name: "role",
      title: "Role",
      type: "string",
    }),
  ],

  preview: {
    select: {
      title: "name",
      subtitle: "role",
      media: "image",
    },
  },
});