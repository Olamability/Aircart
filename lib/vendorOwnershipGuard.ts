import {
  isVendorProductOwner,
  isVendorOrderOwner,
} from "./vendorOwnership";

export const requireVendorProductOwnership = async (
  productId: string,
): Promise<void> => {
  const allowed = await isVendorProductOwner(productId);
  if (!allowed) {
    throw new Error("Unauthorized");
  }
};

export const requireVendorOrderOwnership = async (
  orderId: string,
): Promise<void> => {
  const allowed = await isVendorOrderOwner(orderId);
  if (!allowed) {
    throw new Error("Unauthorized");
  }
};

