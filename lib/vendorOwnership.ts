import { getCurrentVendor } from "./vendor";
import { client } from "@/sanity/lib/client";
export const isVendorProductOwner = async (
  productId: string,
): Promise<boolean> => {
  const vendor = await getCurrentVendor();
  if (!vendor) {
    return false;
  }
  const product = await client.fetch(
    `*[_type == "product" && _id == $productId][0]{ _id, "vendorId": vendor._ref }`,
    { productId },
  );
  if (!product) {
    return false;
  }
  return product.vendorId === vendor._id;
};
