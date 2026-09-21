import { auth } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";
export const getCurrentVendor = async () => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  const vendor = await client.fetch(
    `*[_type == "vendor" && clerkUserId == $userId][0]{ _id, businessName, slug, logo, description, clerkUserId, email, status, createdAt }`,
    { userId },
  );
  return vendor ?? null;
};
