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

export { BRAND_QUERY, BLOG_QUERY, DEAL_PRODUCTS };