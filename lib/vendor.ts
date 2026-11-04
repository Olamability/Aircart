
import { auth } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";

export const getCurrentVendor = async () => {
  const { userId } = await auth();

  if (!userId) return null;

  const vendor = await client.fetch(
    `*[_type == "vendor" && clerkUserId == $userId][0]{
      _id,
      businessName,
      slug,
      logo,
      description,

      email,
      storeEmail,
      phone,

      storeCategory,
      storeSubcategory,
      storeAddress,
      storeCity,
      storeState,
      storeLga,

      registeredBusinessName,
      businessType,
      cacRegistrationNumber,
      taxIdentificationNumber,
      registeredBusinessAddress,
      registeredBusinessCity,
      registeredBusinessState,
      registeredBusinessLga,

      clerkUserId,
      status,
      rejectionReason,
      reviewerNote,
      createdAt,
      updatedAt
    }`,
    { userId },
  );

  return vendor ?? null;
};

export const requireApprovedVendor = async () => {
  const vendor = await getCurrentVendor();

  if (!vendor) {
    throw new Error("Vendor not found");
  }

  if (vendor.status !== "approved") {
    throw new Error("Unauthorized");
  }

  return vendor;
};
