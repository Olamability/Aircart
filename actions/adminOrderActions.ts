"use server";

import { currentUser } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/writeClient";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export const updateOrderStatus = async (
  orderId: string,
  status: "pending" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled",
  note?: string
) => {
  await requirePermission(permissions.orders_update);
  const user = await currentUser();
  const changedBy = user?.emailAddresses?.[0]?.emailAddress || user?.id || "Authorized Admin";

  const historyEntry = {
    _key: crypto.randomUUID(),
    status,
    note: note?.trim() || `Status updated to ${status}`,
    changedBy,
    changedAt: new Date().toISOString(),
  };

  await writeClient
    .patch(orderId)
    .set({ status })
    .setIfMissing({ statusHistory: [] })
    .append("statusHistory", [historyEntry])
    .commit();

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
};

export const cancelOrderAction = async (orderId: string, reason: string) => {
  await requirePermission(permissions.orders_update);
  if (!reason?.trim()) {
    throw new Error("A cancellation reason is required");
  }

  const user = await currentUser();
  const changedBy = user?.emailAddresses?.[0]?.emailAddress || user?.id || "Authorized Admin";

  const historyEntry = {
    _key: crypto.randomUUID(),
    status: "cancelled",
    note: `Order cancelled. Reason: ${reason.trim()}`,
    changedBy,
    changedAt: new Date().toISOString(),
  };

  await writeClient
    .patch(orderId)
    .set({ status: "cancelled" })
    .setIfMissing({ statusHistory: [] })
    .append("statusHistory", [historyEntry])
    .commit();

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
};

export const updatePaymentStatus = async (
  orderId: string,
  paymentStatus: "pending" | "paid" | "failed" | "refunded",
  note?: string,
  paymentReference?: string
) => {
  await requirePermission(permissions.orders_update);
  const user = await currentUser();
  const changedBy = user?.emailAddresses?.[0]?.emailAddress || user?.id || "Authorized Admin";

  const historyEntry = {
    _key: crypto.randomUUID(),
    status: `payment_${paymentStatus}`,
    note: note?.trim() || `Payment status marked as ${paymentStatus}${paymentReference ? ` (Ref: ${paymentReference})` : ""}`,
    changedBy,
    changedAt: new Date().toISOString(),
  };

  const patch = writeClient
    .patch(orderId)
    .set({ paymentStatus })
    .setIfMissing({ statusHistory: [] })
    .append("statusHistory", [historyEntry]);

  if (paymentReference?.trim()) {
    patch.set({ paymentReference: paymentReference.trim() });
  }

  await patch.commit();

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/transactions");
  return { success: true };
};

export const initiateOrderRefundAction = async (orderId: string, reason: string) => {
  await requirePermission(permissions.orders_update);
  if (!reason?.trim()) {
    throw new Error("A reason for the refund is required");
  }

  const user = await currentUser();
  const changedBy = user?.emailAddresses?.[0]?.emailAddress || user?.id || "Authorized Admin";

  const historyEntry = {
    _key: crypto.randomUUID(),
    status: "refund_processed",
    note: `Refund authorized. Reason: ${reason.trim()}`,
    changedBy,
    changedAt: new Date().toISOString(),
  };

  await writeClient
    .patch(orderId)
    .set({ paymentStatus: "refunded" })
    .setIfMissing({ statusHistory: [] })
    .append("statusHistory", [historyEntry])
    .commit();

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/transactions");
  return { success: true };
};
