"use server";

import { writeClient } from "@/sanity/lib/writeClient";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import {
  requireVendorProductOwnership,
  requireVendorOrderOwnership,
} from "@/lib/vendorOwnershipGuard";
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
  await requireVendorOrderOwnership(orderId);

  const validStatuses = [
    "processing",
    "shipped",
    "out_for_delivery",
    "delivered",
  ] as const;

  if (!validStatuses.includes(newStatus)) {
    throw new Error("Invalid shipping status");
  }

  await writeClient.patch(orderId).set({ status: newStatus }).commit();

  revalidatePath("/vendor/orders");
  revalidatePath("/vendor/shipping");
  return { success: true };
};
