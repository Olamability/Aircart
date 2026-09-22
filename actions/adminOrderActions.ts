"use server";

import { writeClient } from "@/sanity/lib/writeClient";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export const updateOrderStatus = async (
  orderId: string,
  status: "pending" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled"
) => {
  await requirePermission(permissions.orders_update);

  await writeClient.patch(orderId).set({ status }).commit();

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
};

export const updatePaymentStatus = async (
  orderId: string,
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
) => {
  await requirePermission(permissions.orders_update);

  await writeClient.patch(orderId).set({ paymentStatus }).commit();

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/transactions");
  return { success: true };
};
