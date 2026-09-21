"use server";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import { writeClient } from "@/sanity/lib/writeClient";
export const uploadVendorLogo = async (file: File) => {
  await requirePermission(permissions.vendor_profile_update);
  if (!file || file.size === 0) {
    throw new Error("Logo is required");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Logo must be less than 5MB");
  }
  const asset = await writeClient.assets.upload("image", file);
  return { success: true, assetId: asset._id };
};
