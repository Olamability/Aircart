import { defineArrayMember, defineType, type Rule } from "sanity";

export const blockContentType = defineType({
  name: "blockContent",
  title: "Block Content",
  type: "array",

  of: [
    defineArrayMember({
      type: "block",

      styles: [
        { title: "Normal", value: "normal" },
        { title: "H1", value: "h1" },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
        { title: "H4", value: "h4" },
        { title: "Quote", value: "blockquote" },
      ],

      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],

      marks: {
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
          { title: "Underline", value: "underline" },
          { title: "Code", value: "code" },
        ],

        annotations: [
          {
            name: "link",
            type: "object",
            title: "Link",

            fields: [
              {
                name: "href",
                type: "url",
                title: "URL",
                validation: (rule: Rule) =>
                  rule.uri({
                    scheme: ["http", "https", "mailto"],
                  }),
              },
            ],
          },
        ],
      },
    }),

    defineArrayMember({
      type: "image",
      options: {
        hotspot: true,
      },
    }),
  ],
});