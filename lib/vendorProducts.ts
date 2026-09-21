import type { Product } from "@/sanity.types";
import { getCurrentVendor } from "./vendor";
import { client } from "@/sanity/lib/client";
export const getCurrentVendorProducts = async (): Promise<Product[]> => {
  const vendor = await getCurrentVendor();
  if (!vendor) {
    return [];
  }
  const products = await client.fetch(
    `*[ _type == "product" && vendor._ref == $vendorId ] | order(_createdAt desc)`,
    { vendorId: vendor._id },
  );
  return products;
};
