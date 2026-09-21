"use server";
import { client } from "@/sanity/lib/client";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import { requireVendorProductOwnership } from "@/lib/vendorOwnershipGuard";
import {
  validateVendorProductInput,
  type VendorProductInput,
} from "@/lib/validators/product";
import { writeClient } from "@/sanity/lib/writeClient";
export const updateVendorProduct = async (
  productId: string,
  data: VendorProductInput,
) => {
  await requirePermission(permissions.products_update);
  await requireVendorProductOwnership(productId);
  const isValid = validateVendorProductInput(data);
  if (!isValid) {
    throw new Error("Invalid product data");
  }
  const categories = await client.fetch(
    `*[_type == "category" && _id in $categoryIds]{ _id }`,
    { categoryIds: data.categoryIds },
  );
  if (categories.length !== data.categoryIds.length) {
    throw new Error("One or more categories not found");
  }
  const categoryReferences = data.categoryIds.map((categoryId) => ({
    _type: "reference",
    _ref: categoryId,
  }));
  const updateData: Record<string, unknown> = {
    title: data.title,
    description: data.description,
    price: data.price,
    discount: data.discount,
    stock: data.stock,
    status: data.status,
    isNew: data.isNew,
    variant: data.variant,
    isfeatured: data.isfeatured,
    categories: categoryReferences,
  };
  if (data.imageAssetId) {
    updateData.image = [
      {
        _key: crypto.randomUUID(),
        _type: "image",
        asset: { _type: "reference", _ref: data.imageAssetId },
      },
    ];
  }
  await writeClient.patch(productId).set(updateData).commit();
  return { success: true };
};
