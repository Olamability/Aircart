"use server";
import { client } from "@/sanity/lib/client";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import { requireVendorProductOwnership } from "@/lib/vendorOwnershipGuard";
import { getCurrentVendor } from "@/lib/vendor";
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
  const vendor = await getCurrentVendor();
  if (!vendor) {
    throw new Error("Vendor not found");
  }
  if (vendor.status !== "approved") {
    throw new Error("Unauthorized");
  }
  const isValid = validateVendorProductInput(data);
  if (!isValid) {
    throw new Error("Invalid product data");
  }
  let brandReference;
  if (data.brandId) {
    const brand = await client.fetch(
      `*[_type == "brand" && _id == $brandId][0]{ _id }`,
      { brandId: data.brandId },
    );
    if (!brand) {
      throw new Error("Brand not found");
    }
    brandReference = { _type: "reference", _ref: brand._id };
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

  let patch = writeClient.patch(productId).set(updateData);
  if (brandReference) {
    patch = patch.set({ brand: brandReference });
  } else {
    patch = patch.unset(["brand"]);
  }

  await patch.commit();
  return { success: true };
};
