"use server";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import { getCurrentVendor } from "@/lib/vendor";
import { writeClient } from "@/sanity/lib/writeClient";
interface VendorProfileInput {
  businessName: string;
  description?: string;
  logoAssetId?: string;
}
export const updateVendorProfile = async (data: VendorProfileInput) => {
  await requirePermission(permissions.vendor_profile_update);
  const vendor = await getCurrentVendor();
  if (!vendor) {
    throw new Error("Vendor not found");
  }
  const businessName = data.businessName.trim();
  if (!businessName) {
    throw new Error("Business name is required");
  }
  const slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const updateData: Record<string, unknown> = {
    businessName,
    slug: { _type: "slug", current: slug },
    description: data.description?.trim() || undefined,
  };
  if (data.logoAssetId) {
    updateData.logo = {
      _type: "image",
      asset: { _type: "reference", _ref: data.logoAssetId },
    };
  }
  await writeClient.patch(vendor._id).set(updateData).commit();
  return { success: true };
};
