import type { Product } from "@/sanity.types";
export type VendorProductInput = {
  title: NonNullable<Product["title"]>;
  description?: Product["description"];
  price: NonNullable<Product["price"]>;
  discount?: Product["discount"];
  stock: NonNullable<Product["stock"]>;
  status?: Product["status"];
  isNew?: Product["isNew"];
  variant?: Product["variant"];
  isfeatured?: Product["isfeatured"];
  brandId?: string;
  categoryIds: string[];
  imageAssetId?: string;
};
export const validateVendorProductInput = (
  data: VendorProductInput,
): boolean => {
  if (!data.title.trim()) return false;
  if (data.price < 0) return false;
  if (data.stock < 0) return false;
  if (!data.categoryIds.length) return false;
  if (
    data.discount !== undefined &&
    (data.discount < 0 || data.discount > 100)
  ) {
    return false;
  }
  return true;
};
