import type { Product } from "@/sanity.types";
import { getCurrentVendor } from "./vendor";
import { client } from "@/sanity/lib/client";

export type VendorProductWithBrand = Omit<Product, "brand" | "categories"> & {
  brand?: { _id: string; title: string; slug?: { current?: string } } | null;
  categories?: { _id: string; title: string }[] | null;
};

export const getCurrentVendorProducts = async (): Promise<VendorProductWithBrand[]> => {
  const vendor = await getCurrentVendor();
  if (!vendor) {
    return [];
  }
  const products = await client.fetch(
    `*[ _type == "product" && vendor._ref == $vendorId ] | order(_createdAt desc){
      ...,
      "brand": brand->{ _id, title, slug },
      "categories": categories[]->{ _id, title }
    }`,
    { vendorId: vendor._id },
  );
  return products ?? [];
};

