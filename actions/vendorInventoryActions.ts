"use server";

import { writeClient } from "@/sanity/lib/writeClient";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import { requireVendorProductOwnership } from "@/lib/vendorOwnershipGuard";
import { getCurrentVendor } from "@/lib/vendor";
import { revalidatePath } from "next/cache";

export const updateVendorStock = async (productId: string, newStock: number) => {
  await requirePermission(permissions.inventory_update);
  await requireVendorProductOwnership(productId);

  if (newStock < 0) {
    throw new Error("Stock cannot be negative");
  }

  await writeClient.patch(productId).set({ stock: newStock }).commit();

  revalidatePath("/vendor/inventory");
  revalidatePath("/vendor");
  return { success: true };
};

export const updateVendorShippingStatus = async (
  orderId: string,
  newStatus: "processing" | "shipped" | "out_for_delivery" | "delivered"
) => {
  await requirePermission(permissions.shipping_manage);
  const vendor = await getCurrentVendor();
  if (!vendor) {
    throw new Error("Unauthorized merchant");
  }

  await writeClient.patch(orderId).set({ status: newStatus }).commit();

  revalidatePath("/vendor/orders");
  revalidatePath("/vendor/shipping");
  return { success: true };
};
