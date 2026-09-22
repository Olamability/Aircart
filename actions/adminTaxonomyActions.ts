"use server";

import { writeClient } from "@/sanity/lib/writeClient";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
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
  });

  revalidatePath("/admin/categories");
  return { success: true, category };
};

export const deleteCategory = async (categoryId: string) => {
  await requirePermission(permissions.categories_delete);

  await writeClient.delete(categoryId);
  revalidatePath("/admin/categories");
  return { success: true };
};

export const createAdminBrand = async (title: string) => {
  await requirePermission(permissions.brands_create);

  if (!title?.trim()) {
    throw new Error("Brand title is required");
  }

  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const brand = await writeClient.create({
    _type: "brand",
    title: title.trim(),
    slug: { _type: "slug", current: slug },
  });

  revalidatePath("/admin/brands");
  return { success: true, brand };
};

export const deleteAdminBrand = async (brandId: string) => {
  await requirePermission(permissions.brands_delete);

  await writeClient.delete(brandId);
  revalidatePath("/admin/brands");
  return { success: true };
};
