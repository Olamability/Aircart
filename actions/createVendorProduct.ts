"use server";
import { client } from "@/sanity/lib/client";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import { getCurrentVendor } from "@/lib/vendor";
import {
  validateVendorProductInput,
  type VendorProductInput,
} from "@/lib/validators/product";
import { writeClient } from "@/sanity/lib/writeClient";
export const createVendorProduct = async (data: VendorProductInput) => {
  await requirePermission(permissions.products_create);
  const vendor = await getCurrentVendor();
  if (!vendor) {
    throw new Error("Vendor not found");
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
  const slug = data.title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const product = await writeClient.create({
    _type: "product",
    title: data.title,
    slug: { _type: "slug", current: slug },
    description: data.description,
    price: data.price,
    discount: data.discount,
    stock: data.stock,
    status: data.status,
    isNew: data.isNew,
    variant: data.variant,
    isfeatured: data.isfeatured,
    brand: brandReference,
    categories: categoryReferences,
    vendor: { _type: "reference", _ref: vendor._id },
  });
  return { success: true, productId: product._id };
};
