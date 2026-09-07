import { defineField, defineType } from "sanity";
import { HomeIcon } from "@sanity/icons/Home";


export const addressType = defineType({
  name: "address",
  title: "Addresses",
  type: "document",
  icon: HomeIcon,
  

  fields: [
    defineField({
      name: "fullName",
      title: "Full Name",
      type: "string",
      description: "A friendly name for this address (e.g. Home, Work, Shop)",
      validation: (Rule) => Rule.required() .max(50),
    }),

    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "email",
      title: "User Email",
      type: "email",
      
    }),

    defineField({
      name: "street",
      title: "Street Address",
      type: "string",
      description: "The street address including apartment/unit/house number",
      validation: (Rule) => Rule.required() .min(5) .max(100),
    }),

    defineField({
      name: "city",
      title: "City",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "state",
      title: "State",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "country",
      title: "Country",
      type: "string",
      initialValue: "Nigeria",
    }),

    defineField({
      name: "postalCode",
      title: "Postal Code",
      type: "string",
    }),

    defineField({
      name: "zip",
      title: "Zip Code",
      type: "string",
      description: "Format: 12345 or 12345-6789",
      validation: (Rule) =>
        Rule.required()
      .regex(/^\{5}(-\d{4})?$/, {
        invert: false,
        name: "zipcode", 
        
      })
    .custom((zip: string | undefined) => {
      if(!zip) {
        return "ZIP code is required";
      }
      if(!zip.match(/^\{5}(-\d{4})?$/)) {
        return "Please enter a valid ZIP code (e.g. 12345 or 12345-6789)";
      }
      return true;
    }),
  }),

    defineField({
      name: "Default",
      title: "Default Address",
      type: "boolean",
      description: "Is this the default shipping/delivery address?",
      initialValue: false,
    }),

        defineField({
      name: "CreatedAT",
      title: "Created At",
      type: "datetime",
      description: "Is this the default shipping/delivery address?",
      initialValue: () => new Date().toISOString(),
    }),
  ],

  preview: {
    select: {
      title: "fullName",
      subtitle: "street",
      city: "city",
      state: "state",
      isDefault: "Default",
    },
    prepare({ title, subtitle, city, state, isDefault }) {
      return {
        title: `${title}${isDefault ? " (Default)" : ""}`,
        subtitle: `${subtitle}, ${city}, ${state}`,
      };
    },
  },
});