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

const PRODUCT_BY_SLUG_QUERY = defineQuery(`
  *[_type == "product" && slug.current == $slug] | order(title asc) [0] {
    ...,
    "categories": categories[]->{
      _id,
      title,
      slug
    },
    "brand": brand->{
      _id,
      title,
      slug
    }
  }
`);

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
    CreatedAT,
    clerkUserId
  }
`);

export {
  BRAND_QUERY,
  BLOG_QUERY,
  DEAL_PRODUCTS,
  PRODUCT_BY_SLUG_QUERY,
  BRANDQ,
  ADDRESS_QUERY,
};
