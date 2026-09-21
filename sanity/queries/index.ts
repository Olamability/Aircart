import { sanityFetch } from "../lib/live";
import { client } from "../lib/client";

import type {
  Category,
  Product,
  BRAND_QUERY_RESULT,
  BLOG_QUERY_RESULT,
  DEAL_PRODUCTS_RESULT,
  PRODUCT_BY_SLUG_QUERY_RESULT,
  ADDRESS_QUERY_RESULT,
  MY_ORDERS_QUERY_RESULT,
} from "@/sanity.types";
import {
  BRAND_QUERY,
  BLOG_QUERY,
  DEAL_PRODUCTS,
  PRODUCT_BY_SLUG_QUERY,
  BRANDQ,
  ADDRESS_QUERY,
  MY_ORDERS_QUERY,
  BRAND_SEARCH_QUERY,
  VENDOR_BY_SLUG_QUERY,
} from "./query";
type ProductBySlug = NonNullable<PRODUCT_BY_SLUG_QUERY_RESULT>;

type ProductBySlugWithVendor = Omit<ProductBySlug, "vendor"> & {
  vendor?: {
    _id: string;
    businessName: string;
    slug?: {
      current?: string;
    };
    logo?: {
      asset?: {
        _ref: string;
        _type: "reference";
      };
    };
    description?: string;
    status?: string;
  };
};

const getCategories = async (quantity?: number) => {
  try {
    const query = quantity
      ? `*[_type == "category"] | order(title asc)[0...$quantity] {
          ...,
          "productCount": count(*[_type == "product" && references(^._id)])
        }`
      : `*[_type == "category"] | order(title asc) {
          ...,
          "productCount": count(*[_type == "product" && references(^._id)])
        }`;

    const { data } = await sanityFetch({
      query,
      params: quantity ? { quantity } : {},
    });

    return (data as (Category & { productCount: number })[]) ?? [];
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

    return (data as BRAND_QUERY_RESULT) ?? [];
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

    return (data as BLOG_QUERY_RESULT) ?? [];
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

    return (data as DEAL_PRODUCTS_RESULT) ?? [];
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

    return (data as ProductBySlugWithVendor) ?? null;
  } catch (error) {
    console.log("Error fetching product by ID:", error);
    return null;
  }
};
type VendorBySlug = {
  _id: string;
  businessName: string;
  slug?: { current?: string };
  logo?: { asset?: { _ref: string; _type: "reference" } };
  description?: string;
  status?: string;
  createdAt?: string;
  products?: Product[];
};
const getVendorBySlug = async (slug: string): Promise<VendorBySlug | null> => {
  try {
    const { data } = await sanityFetch({
      query: VENDOR_BY_SLUG_QUERY,
      params: { slug },
    });
    return (data as VendorBySlug) ?? null;
  } catch (error) {
    console.log("Error fetching vendor by slug:", error);
    return null;
  }
};

const getBrandQ = async (slug: string) => {
  try {
    const data = await client.fetch(BRANDQ, { slug });

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

    return (data as ADDRESS_QUERY_RESULT) ?? [];
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return [];
  }
};
const getMyOrders = async (userId: string): Promise<MY_ORDERS_QUERY_RESULT> => {
  try {
    const data = await client.fetch(MY_ORDERS_QUERY, { userId });

    return data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

export {
  getCategories,
  getBrands,
  getBlogs,
  getDealProduct,
  getProductBySlug,
  getVendorBySlug,
  getBrandQ,
  getAddresses,
  getMyOrders,
  BRAND_SEARCH_QUERY,
};
