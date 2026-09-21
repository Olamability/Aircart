"use server";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import { writeClient } from "@/sanity/lib/writeClient";
import { client } from "@/sanity/lib/client";
export const createVendorBrand = async (title: string) => {
  await requirePermission(permissions.brands_create);
  const brandTitle = title.trim();
  if (!brandTitle) {
    throw new Error("Brand name is required");
  }
  const existingBrand = await client.fetch(
    `*[_type == "brand" && lower(title) == lower($title)][0]{ _id, title, slug }`,
    { title: brandTitle },
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
  return {
    success: true,
    brand: { _id: brand._id, title: brand.title, slug: brand.slug },
    existing: false,
  };
};
