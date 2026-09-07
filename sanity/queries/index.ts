import { sanityFetch } from "../lib/live";
import { BRAND_QUERY, BLOG_QUERY, DEAL_PRODUCTS } from "./query";

const getCategories = async (quantity?: number) => {
  try {
    const query = quantity
      ? `*[_type == 'category'] | order(title asc)[0...$quantity] {
          ...,
          "productCount": count(*[
            _type == "product" &&
            references(^._id)
          ])
        }`
      : `*[_type == 'category'] | order(title asc) {
          ...,
          "productCount": count(*[
            _type == "product" &&
            references(^._id)
          ])
        }`;

    const { data } = await sanityFetch({
      query,
      params: quantity ? { quantity } : {},
    });

    return data ?? [];
  } catch (error) {
    console.log("Error fetching categories:", error);
    return [];
  }
};

const getBrands = async () => {
  try {
    const { data } = await sanityFetch({
      query: BRAND_QUERY,
    });

    return data ?? [];
  } catch (error) {
    console.log("Error fetching brands:", error);
    return [];
  }
};

const getBlogs = async () => {
  try {
    const { data } = await sanityFetch({
      query: BLOG_QUERY,
    });

    return data ?? [];
  } catch (error) {
    console.log("Error fetching blogs:", error);
    return [];
  }
};
const getDealProduct = async () => {
  try {
    const { data } = await sanityFetch({
      query: DEAL_PRODUCTS,
    });

    return data ?? [];
  } catch (error) {
    console.log("Error fetching deals:", error);
    return [];
  }
};


export { getCategories, getBrands, getBlogs, getDealProduct };