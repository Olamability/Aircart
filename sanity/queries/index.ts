import { sanityFetch } from "../lib/live";
import {
  BRAND_QUERY,
  BLOG_QUERY,
  DEAL_PRODUCTS,
  PRODUCT_BY_SLUG_QUERY,
  BRANDQ,
  ADDRESS_QUERY,
} from "./query";

const getCategories = async (quantity?: number) => {
  try {
    const query = quantity
      ? `*[_type == "category"] | order(title asc)[0...$quantity] {
          ...
        }`
      : `*[_type == "category"] | order(title asc) {
          ...
        }`;

    const { data } = await sanityFetch({
      query,
      params: quantity ? { quantity } : {},
    });

    return data ?? [];
  } catch (error) {
    console.error("Error fetching categories:", error);
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

const getProductBySlug = async (slug: string) => {
  try {
    const { data } = await sanityFetch({
      query: PRODUCT_BY_SLUG_QUERY,
      params: { slug },
    });

    return data ?? null;
  } catch (error) {
    console.log("Error fetching product by ID:", error);
    return null;
  }
};

const getBrandQ = async (slug: string) => {
  try {
    const { data } = await sanityFetch({
      query: BRANDQ,
      params: { slug },
    });

    return data ?? null;
  } catch (error) {
    console.log("Error fetching Brand:", error);
    return null;
  }
};

const getAddresses = async (userId: string) => {
  try {
    const { data } = await sanityFetch({
      query: ADDRESS_QUERY,
      params: { userId },
    });

    return data ?? [];
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return [];
  }
};

export {
  getCategories,
  getBrands,
  getBlogs,
  getDealProduct,
  getProductBySlug,
  getBrandQ,
  getAddresses,
};
