import { getCurrentVendor } from "./vendor";
import { client } from "@/sanity/lib/client";
import type { Product } from "@/sanity.types";
export type VendorProductWithBrand = Omit<Product, "brand" | "categories"> & {
  brand?: { _id: string; title: string; slug?: { current?: string } };
  categories?: { _id: string; title: string }[];
};
export const getCurrentVendorProduct = async (
  productId: string,
): Promise<VendorProductWithBrand | null> => {
  const vendor = await getCurrentVendor();
  if (!vendor) {
    return null;
  }
  const product = await client.fetch(
    `*[ _type == "product" && _id == $productId && vendor._ref == $vendorId ][0]{ ..., "brand": brand->{ _id, title, slug }, "categories": categories[]->{ _id, title } }`,
    { productId, vendorId: vendor._id },
  );
  return product ?? null;
};
export const getCurrentVendorProducts = async (): Promise<
  VendorProductWithBrand[]
> => {
  const vendor = await getCurrentVendor();
  if (!vendor) {
    return [];
  }
  const products = await client.fetch(
    `*[ _type == "product" && vendor._ref == $vendorId ] | order(_createdAt desc){ ..., "brand": brand->{ _id, title, slug }, "categories": categories[]->{ _id, title } }`,
    { vendorId: vendor._id },
  );
  return products ?? [];
};
