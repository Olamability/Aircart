"use server";

import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
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

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const businessName = data.businessName.trim();
  if (!businessName) {
    throw new Error("Business name is required");
  }

  const slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const vendor = await getCurrentVendor();

  if (vendor) {
    // Update existing vendor document
    const updateData: Record<string, unknown> = {
      businessName,
      slug: { _type: "slug", current: slug },
    };

    const trimmedDescription = data.description?.trim();
    if (trimmedDescription !== undefined) {
      updateData.description = trimmedDescription;
    }

    if (data.logoAssetId) {
      updateData.logo = {
        _type: "image",
        asset: { _type: "reference", _ref: data.logoAssetId },
      };
    }

    await writeClient.patch(vendor._id).set(updateData).commit();
  } else {
    // Create new vendor document for first-time vendor onboarding
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress || "";

    const newVendor: {
      _type: "vendor";
      businessName: string;
      slug: { _type: "slug"; current: string };
      clerkUserId: string;
      email: string;
      status: string;
      createdAt: string;
      description?: string;
      logo?: {
        _type: "image";
        asset: { _type: "reference"; _ref: string };
      };
    } = {
      _type: "vendor",
      businessName,
      slug: { _type: "slug", current: slug },
      clerkUserId: userId,
      email,
      status: "approved",
      createdAt: new Date().toISOString(),
    };

    const trimmedDescription = data.description?.trim();
    if (trimmedDescription) {
      newVendor.description = trimmedDescription;
    }

    if (data.logoAssetId) {
      newVendor.logo = {
        _type: "image",
        asset: { _type: "reference", _ref: data.logoAssetId },
      };
    }

    await writeClient.create(newVendor);
  }

  revalidatePath("/vendor/profile");
  revalidatePath("/vendor");

  return { success: true };
};
