"use server";

import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/writeClient";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export interface AdminProductInput {
  title: string;
  description?: string;
  price: number;
  discount?: number;
  stock: number;
  status?: "new" | "hot" | "sale" | "available";
  isNew?: boolean;
  variant?: "gadget" | "appliances" | "refrigerator" | "others" | "food & beverages";
  isfeatured?: boolean;
  brandId?: string;
  categoryIds: string[];
  vendorId: string;
  imageAssetId?: string;
}

export const createAdminProduct = async (data: AdminProductInput) => {
  await requirePermission(permissions.products_create);

  if (!data.title?.trim()) {
    throw new Error("Product title is required");
  }
  if (data.price < 0) {
    throw new Error("Price cannot be negative");
  }
  if (data.stock < 0) {
    throw new Error("Stock cannot be negative");
  }
  if (!data.vendorId) {
    throw new Error("Vendor assignment is required");
  }
  if (!data.categoryIds?.length) {
    throw new Error("At least one category is required");
  }

  // Validate vendor exists
  const vendor = await client.fetch(
    `*[_type == "vendor" && _id == $vendorId][0]{ _id }`,
    { vendorId: data.vendorId }
  );
  if (!vendor) {
    throw new Error("Selected vendor does not exist");
  }

  let brandReference;
  if (data.brandId) {
    brandReference = { _type: "reference", _ref: data.brandId };
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

  const doc: { _type: "product"; [key: string]: unknown } = {
    _type: "product",
    title: data.title,
    slug: { _type: "slug", current: `${slug}-${Date.now()}` },
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
  };

  if (data.imageAssetId) {
    doc.image = [
      {
        _key: crypto.randomUUID(),
        _type: "image",
        asset: { _type: "reference", _ref: data.imageAssetId },
      },
    ];
  }

  const created = await writeClient.create(doc);
  revalidatePath("/admin/products");
  return { success: true, productId: created._id };
};

export const updateAdminProduct = async (
  productId: string,
  data: Partial<AdminProductInput>
) => {
  await requirePermission(permissions.products_update);

  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.discount !== undefined) updateData.discount = data.discount;
  if (data.stock !== undefined) updateData.stock = data.stock;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.isNew !== undefined) updateData.isNew = data.isNew;
  if (data.variant !== undefined) updateData.variant = data.variant;
  if (data.isfeatured !== undefined) updateData.isfeatured = data.isfeatured;

  if (data.vendorId) {
    updateData.vendor = { _type: "reference", _ref: data.vendorId };
  }
  if (data.brandId) {
    updateData.brand = { _type: "reference", _ref: data.brandId };
  }
  if (data.categoryIds) {
    updateData.categories = data.categoryIds.map((id) => ({
      _type: "reference",
      _ref: id,
    }));
  }

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
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  return { success: true };
};

export const deleteAdminProduct = async (productId: string) => {
  await requirePermission(permissions.products_delete);
  await writeClient.delete(productId);
  revalidatePath("/admin/products");
  return { success: true };
};
