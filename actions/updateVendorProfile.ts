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

const generateUniqueVendorSlug = async (
  businessName: string,
  excludeVendorId?: string
): Promise<string> => {
  const rawSlug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const baseSlug =
    (rawSlug.length > 80 ? rawSlug.slice(0, 80).replace(/-+$/, "") : rawSlug) ||
    "vendor";

  const cleanId = excludeVendorId?.replace(/^drafts\./, "") || "";

  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const count = await writeClient.fetch<number>(
      `count(*[_type == "vendor" && slug.current == $candidate && !(_id in [$cleanId, "drafts." + $cleanId])])`,
      {
        candidate,
        cleanId,
      }
    );

    if (count === 0) {
      return candidate;
    }

    counter++;
    candidate = `${baseSlug}-${counter}`;
  }
};

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

  const vendor = await getCurrentVendor();

  if (vendor) {
    // Preserve existing slug if business name has not changed and slug exists
    const hasNameChanged =
      vendor.businessName?.trim().toLowerCase() !== businessName.toLowerCase();

    const finalSlug =
      !hasNameChanged && vendor.slug?.current
        ? vendor.slug.current
        : await generateUniqueVendorSlug(businessName, vendor._id);

    // Update existing vendor document
    const updateData: Record<string, unknown> = {
      businessName,
      slug: { _type: "slug", current: finalSlug },
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

    if (vendor.slug?.current && vendor.slug.current !== finalSlug) {
      revalidatePath(`/vendor/${vendor.slug.current}`);
    }
    revalidatePath(`/vendor/${finalSlug}`);
  } else {
    // Create new vendor document for first-time vendor onboarding with collision-safe slug
    const finalSlug = await generateUniqueVendorSlug(businessName);

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
      slug: { _type: "slug", current: finalSlug },
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
    revalidatePath(`/vendor/${finalSlug}`);
  }

  revalidatePath("/vendor/profile");
  revalidatePath("/vendor");

  return { success: true };
};
