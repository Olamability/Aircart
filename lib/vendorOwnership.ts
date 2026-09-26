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

export const isVendorOrderOwner = async (
  orderId: string,
): Promise<boolean> => {
  if (!orderId || typeof orderId !== "string") {
    return false;
  }
  const vendor = await getCurrentVendor();
  if (!vendor) {
    return false;
  }
  const order = await client.fetch(
    `*[_type == "order" && _id == $orderId && count(products[product->vendor._ref == $vendorId]) > 0][0]{ _id }`,
    { orderId, vendorId: vendor._id },
  );
  return Boolean(order?._id);
};

