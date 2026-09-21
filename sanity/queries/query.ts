import { defineQuery } from "next-sanity";
const BRAND_QUERY = defineQuery(`
  *[_type == "brand"] | order(title desc)
`);

const BLOG_QUERY = defineQuery(`
  *[_type == "blog"]
| order(publishedAt desc) {
  ...,
  "category": category->title
}
`);

const DEAL_PRODUCTS = defineQuery(`
  *[_type == "product" && status == "hot"]
  | order(_createdAt desc) {
    ...,
    "categories": categories[]->title,
    "brand": brand->title
  }
`);

const PRODUCT_BY_SLUG_QUERY = defineQuery(
  ` *[_type == "product" && slug.current == $slug] | order(title asc) [0] { ..., "categories": categories[]->{ _id, title, slug }, "brand": brand->{ _id, title, slug }, "vendor": vendor->{ _id, businessName, slug, logo, description, status } } `,
);

const BRANDQ = defineQuery(`
  *[
    _type == "product" &&
    slug.current == $slug
  ][0].brand->{
    _id,
    title,
    slug
  }
`);
export const PRODUCT_BY_VARIANT_QUERY = defineQuery(`
  *[
    _type == "product" &&
    variant == $variant
  ]
  | order(title desc) {
    ...,
    "categories": categories[]->title
  }
`);

const ADDRESS_QUERY = defineQuery(`
  *[
    _type == "address" &&
    clerkUserId == $userId
  ] | order(Default desc, CreatedAT desc) {
    _id,
    fullName,
    phone,
    email,
    street,
    city,
    state,
    country,
    postalCode,
    zip,
    Default,
    label,
    CreatedAT,
    clerkUserId
  }
`);
const MY_ORDERS_QUERY = defineQuery(
  `*[_type == "order" && clerkUserId == 
  $userId] | order(orderDate desc)
  {...,products[]{...,product->}}`,
);
const BRAND_SEARCH_QUERY = defineQuery(
  ` *[ _type == "brand" && lower(title) match $search ] | order(title asc)[0...20] { _id, title, slug } `,
);
const VENDOR_BY_SLUG_QUERY = defineQuery(
  ` *[_type == "vendor" && slug.current == $slug][0]{ _id, businessName, slug, logo, description, status, createdAt, "products": *[ _type == "product" && vendor._ref == ^._id ]{ _id, _type, _createdAt, _updatedAt, _rev, title, slug, image, description, price, discount, "categories": coalesce(categories, []), stock, brand, status, images, isNew, variant, isfeatured, vendor } } `,
);

export {
  BRAND_QUERY,
  BLOG_QUERY,
  DEAL_PRODUCTS,
  PRODUCT_BY_SLUG_QUERY,
  BRANDQ,
  ADDRESS_QUERY,
  MY_ORDERS_QUERY,
  BRAND_SEARCH_QUERY,
  VENDOR_BY_SLUG_QUERY,
};
