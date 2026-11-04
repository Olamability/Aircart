
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

  storeEmail?: string;
  phone?: string;
  storeCategory?: string;
  storeSubcategory?: string;
  storeAddress?: string;
  storeCity?: string;
  storeState?: string;
  storeLga?: string;

  registeredBusinessName?: string;
  businessType?: string;
  cacRegistrationNumber?: string;
  taxIdentificationNumber?: string;
  registeredBusinessAddress?: string;
  registeredBusinessCity?: string;
  registeredBusinessState?: string;
  registeredBusinessLga?: string;
}

const generateUniqueVendorSlug = async (
  businessName: string,
  excludeVendorId?: string,
): Promise<string> => {
  const rawSlug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const baseSlug =
    (rawSlug.length > 80
      ? rawSlug.slice(0, 80).replace(/-+$/, "")
      : rawSlug) || "vendor";

  const cleanId = excludeVendorId?.replace(/^drafts\./, "") || "";

  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const count = await writeClient.fetch<number>(
      `count(*[_type == "vendor" && slug.current == $candidate && !(_id in [$cleanId, "drafts." + $cleanId])])`,
      {
        candidate,
        cleanId,
      },
    );

    if (count === 0) {
      return candidate;
    }

    counter++;
    candidate = `${baseSlug}-${counter}`;
  }
};

const optionalTextFields = [
  "description",
  "storeEmail",
  "phone",
  "storeCategory",
  "storeSubcategory",
  "storeAddress",
  "storeCity",
  "storeState",
  "storeLga",
  "registeredBusinessName",
  "businessType",
  "cacRegistrationNumber",
  "taxIdentificationNumber",
  "registeredBusinessAddress",
  "registeredBusinessCity",
  "registeredBusinessState",
  "registeredBusinessLga",
] as const;

type OptionalTextField = (typeof optionalTextFields)[number];

const buildProfileFields = (
  data: VendorProfileInput,
): Partial<Record<OptionalTextField, string>> => {
  const fields: Partial<Record<OptionalTextField, string>> = {};

  for (const field of optionalTextFields) {
    const value = data[field];

    if (typeof value === "string") {
      fields[field] = value.trim();
    }
  }

  return fields;
};

export const updateVendorProfile = async (data: VendorProfileInput) => {
  await requirePermission(permissions.vendor_profile_update);

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const businessName = data.businessName?.trim();

  if (!businessName) {
    throw new Error("Business name is required");
  }

  if (businessName.length > 100) {
    throw new Error("Business name cannot exceed 100 characters");
  }

  const vendor = await getCurrentVendor();
  const profileFields = buildProfileFields(data);
  const now = new Date().toISOString();

  if (vendor) {
    const hasNameChanged =
      vendor.businessName?.trim().toLowerCase() !==
      businessName.toLowerCase();

    const finalSlug =
      !hasNameChanged && vendor.slug?.current
        ? vendor.slug.current
        : await generateUniqueVendorSlug(businessName, vendor._id);

    const updateData: Record<string, unknown> = {
      businessName,
      slug: { _type: "slug", current: finalSlug },
      updatedAt: now,
      ...profileFields,
    };

    if (data.logoAssetId) {
      updateData.logo = {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: data.logoAssetId,
        },
      };
    }

    await writeClient.patch(vendor._id).set(updateData).commit();

    if (vendor.slug?.current && vendor.slug.current !== finalSlug) {
      revalidatePath(`/vendor/${vendor.slug.current}`);
    }

    revalidatePath(`/vendor/${finalSlug}`);
  } else {
    const finalSlug = await generateUniqueVendorSlug(businessName);

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress || "";

    const newVendor = {
      _type: "vendor" as const,
      businessName,
      slug: { _type: "slug" as const, current: finalSlug },
      clerkUserId: userId,
      email,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      ...profileFields,
      ...(data.logoAssetId
        ? {
          logo: {
            _type: "image" as const,
            asset: {
              _type: "reference" as const,
              _ref: data.logoAssetId,
            },
          },
        }
        : {}),
    };

    await writeClient.create(newVendor);

    revalidatePath(`/vendor/${finalSlug}`);
  }

  revalidatePath("/vendor/profile");
  revalidatePath("/vendor");

  return { success: true };
};
