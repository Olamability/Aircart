"use server";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import { searchBrands as searchBrandsFromSanity } from "@/sanity/lib/brand";
export const searchBrands = async (search: string) => {
  await requirePermission(permissions.brands_view);
  return searchBrandsFromSanity(search);
};
