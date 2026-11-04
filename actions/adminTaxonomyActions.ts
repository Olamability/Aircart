"use server";

import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/writeClient";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import { getUserRole } from "@/lib/roles";
import { requireApprovedVendor } from "@/lib/vendor";
import { revalidatePath } from "next/cache";

export const createCategory = async (title: string, description?: string) => {
  await requirePermission(permissions.categories_create);

  if (!title?.trim()) {
    throw new Error("Category title is required");
  }

  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const category = await writeClient.create({
    _type: "category",
    title: title.trim(),
    slug: { _type: "slug", current: slug },
    description: description?.trim(),
    hidden: false,
  });

  revalidatePath("/admin/categories");
  return { success: true, category };
};

export const updateCategory = async (
  categoryId: string,
  data: { title?: string; description?: string; hidden?: boolean }
) => {
  await requirePermission(permissions.categories_update);

  const update: Record<string, unknown> = {};
  if (data.title !== undefined) update.title = data.title.trim();
  if (data.description !== undefined) update.description = data.description.trim();
  if (data.hidden !== undefined) update.hidden = data.hidden;

  await writeClient.patch(categoryId).set(update).commit();
  revalidatePath("/admin/categories");
  return { success: true };
};

export const deleteCategory = async (categoryId: string, force = false) => {
  await requirePermission(permissions.categories_delete);

  // Check product dependencies
  const productCount = await client.fetch(
    `count(*[_type == "product" && references($categoryId)])`,
    { categoryId }
  );

  if (productCount > 0 && !force) {
    throw new Error(
      `Cannot delete category: ${productCount} product(s) are still assigned to it. Reassign or archive those products first.`
    );
  }

  await writeClient.delete(categoryId);
  revalidatePath("/admin/categories");
  return { success: true };
};

export const toggleCategoryVisibility = async (categoryId: string, hidden: boolean) => {
  await requirePermission(permissions.categories_update);
  await writeClient.patch(categoryId).set({ hidden }).commit();
  revalidatePath("/admin/categories");
  return { success: true, hidden };
};

export const createBrand = async (title: string, description?: string) => {
  await requirePermission(permissions.brands_create);
  const role = await getUserRole();
  if (role === "vendor") {
    await requireApprovedVendor();
  }

  const brandTitle = title.trim();
  if (!brandTitle) {
    throw new Error("Brand name is required");
  }

  const existingBrand = await client.fetch(
    `*[_type == "brand" && lower(title) == lower($title)][0]{ _id, title, slug }`,
    { title: brandTitle }
  );

  if (existingBrand) {
    return { success: true, brand: existingBrand, existing: true };
  }

  const slug = brandTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const brand = await writeClient.create({
    _type: "brand",
    title: brandTitle,
    slug: { _type: "slug", current: slug },
    description: description?.trim(),
    hidden: false,
  });

  revalidatePath("/admin/brands");
  return {
    success: true,
    brand: { _id: brand._id, title: brand.title, slug: brand.slug },
    existing: false,
  };
};

export const createAdminBrand = createBrand;

export const updateBrand = async (
  brandId: string,
  data: { title?: string; description?: string; hidden?: boolean }
) => {
  await requirePermission(permissions.brands_update);

  const update: Record<string, unknown> = {};
  if (data.title !== undefined) update.title = data.title.trim();
  if (data.description !== undefined) update.description = data.description.trim();
  if (data.hidden !== undefined) update.hidden = data.hidden;

  await writeClient.patch(brandId).set(update).commit();
  revalidatePath("/admin/brands");
  return { success: true };
};

export const deleteAdminBrand = async (brandId: string, force = false) => {
  await requirePermission(permissions.brands_delete);

  // Check product dependencies
  const productCount = await client.fetch(
    `count(*[_type == "product" && brand._ref == $brandId])`,
    { brandId }
  );

  if (productCount > 0 && !force) {
    throw new Error(
      `Cannot delete brand: ${productCount} product(s) are still assigned to it. Reassign those products first.`
    );
  }

  await writeClient.delete(brandId);
  revalidatePath("/admin/brands");
  return { success: true };
};

export const toggleBrandVisibility = async (brandId: string, hidden: boolean) => {
  await requirePermission(permissions.brands_update);
  await writeClient.patch(brandId).set({ hidden }).commit();
  revalidatePath("/admin/brands");
  return { success: true, hidden };
};
