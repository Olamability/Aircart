"use server";

import { client } from "@/sanity/lib/client";
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

export const createBrand = async (title: string) => {
  await requirePermission(permissions.brands_create);

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
  });

  revalidatePath("/admin/brands");
  return {
    success: true,
    brand: { _id: brand._id, title: brand.title, slug: brand.slug },
    existing: false,
  };
};

export const createAdminBrand = createBrand;

export const deleteAdminBrand = async (brandId: string) => {
  await requirePermission(permissions.brands_delete);

  await writeClient.delete(brandId);
  revalidatePath("/admin/brands");
  return { success: true };
};
