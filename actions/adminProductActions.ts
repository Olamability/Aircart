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
  status?: "new" | "hot" | "sale" | "available" | "draft" | "archived";
  isNew?: boolean;
  variant?: "gadget" | "appliances" | "refrigerator" | "others" | "food & beverages";
  isfeatured?: boolean;
  brandId?: string;
  categoryIds: string[];
  vendorId?: string; // Optional for platform-owned products
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
  if (!data.categoryIds?.length) {
    throw new Error("At least one category is required");
  }

  // Validate vendor if assigned (platform-owned products omit vendor)
  const isVendorProduct = Boolean(data.vendorId && data.vendorId !== "platform");
  let vendorReference: { _type: "reference"; _ref: string } | undefined;

  if (isVendorProduct && data.vendorId) {
    const vendor = await client.fetch(
      `*[_type == "vendor" && _id == $vendorId][0]{ _id }`,
      { vendorId: data.vendorId }
    );
    if (!vendor) {
      throw new Error("Selected vendor does not exist");
    }
    vendorReference = { _type: "reference", _ref: vendor._id };
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
    status: data.status || "available",
    isNew: data.isNew,
    variant: data.variant,
    isfeatured: data.isfeatured,
    brand: brandReference,
    categories: categoryReferences,
  };

  if (vendorReference) {
    doc.vendor = vendorReference;
  }

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

  if (data.brandId !== undefined) {
    updateData.brand = data.brandId ? { _type: "reference", _ref: data.brandId } : null;
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

  let patch = writeClient.patch(productId).set(updateData);

  // Manage vendor ownership: platform vs specific vendor
  if (data.vendorId === "platform" || data.vendorId === "") {
    patch = patch.unset(["vendor"]);
  } else if (data.vendorId) {
    patch = patch.set({ vendor: { _type: "reference", _ref: data.vendorId } });
  }

  await patch.commit();
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  return { success: true };
};

export const toggleProductPublishAction = async (productId: string, publish: boolean) => {
  await requirePermission(permissions.products_publish);

  const newStatus = publish ? "available" : "draft";
  await writeClient.patch(productId).set({ status: newStatus }).commit();

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  return { success: true, status: newStatus };
};

export const adjustProductStockAction = async (
  productId: string,
  newStock: number,
  reason?: string
) => {
  await requirePermission(permissions.inventory_update);

  if (newStock < 0) {
    throw new Error("Stock cannot be negative");
  }

  await writeClient.patch(productId).set({ stock: newStock }).commit();

  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  return { success: true };
};

export const deleteAdminProduct = async (productId: string) => {
  await requirePermission(permissions.products_delete);
  await writeClient.delete(productId);
  revalidatePath("/admin/products");
  return { success: true };
};
