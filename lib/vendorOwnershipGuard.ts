import { isVendorProductOwner } from "./vendorOwnership";
export const requireVendorProductOwnership = async (
  productId: string,
): Promise<void> => {
  const allowed = await isVendorProductOwner(productId);
  if (!allowed) {
    throw new Error("Unauthorized");
  }
};
