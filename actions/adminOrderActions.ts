"use server";

import { currentUser } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/writeClient";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

interface ValidatedOrder {
  _id: string;
  _type: string;
  _rev: string;
}

const VALID_ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

const VALID_PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
] as const;

/**
 * Validates the order ID and ensures the target document exists, is of type "order",
 * is not a draft document, and retrieves its current revision ID for optimistic locking.
 */
const validateAndGetOrder = async (orderId: string): Promise<ValidatedOrder> => {
  if (!orderId || typeof orderId !== "string" || !orderId.trim()) {
    throw new Error("Invalid order ID: ID must be a non-empty string.");
  }

  const trimmedId = orderId.trim();

  if (trimmedId.startsWith("drafts.")) {
    throw new Error("Invalid order ID: Draft order documents cannot be mutated directly.");
  }

  const order = await writeClient.fetch<ValidatedOrder | null>(
    `*[_id == $orderId][0]{ _id, _type, _rev }`,
    { orderId: trimmedId }
  );

  if (!order) {
    throw new Error(`Order not found: No order exists with ID "${trimmedId}".`);
  }

  if (order._type !== "order") {
    throw new Error(`Invalid document type: Document "${trimmedId}" is a "${order._type}", not an "order".`);
  }

  if (!order._rev) {
    throw new Error(`Invalid order state: Document "${trimmedId}" is missing revision metadata.`);
  }

  return order;
};

/**
 * Commits a mutation with Sanity revision check and throws a meaningful error if a revision conflict occurs.
 */
const commitOrderMutation = async (patch: ReturnType<typeof writeClient.patch>) => {
  try {
    await patch.commit();
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string } | null;
    if (
      err?.statusCode === 409 ||
      err?.message?.toLowerCase().includes("conflict") ||
      err?.message?.toLowerCase().includes("revision")
    ) {
      throw new Error("Order revision conflict: This order was updated concurrently. Please refresh the page and try again.");
    }
    throw error;
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: "pending" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled",
  note?: string
) => {
  await requirePermission(permissions.orders_update);
  if (
    !VALID_ORDER_STATUSES.includes(
      status as (typeof VALID_ORDER_STATUSES)[number]
    )
  ) {
    throw new Error("Invalid order fulfillment status.");
  }

  if (status === "cancelled" && (!note || !note.trim())) {
    throw new Error("A cancellation reason is required when cancelling an order.");
  }

  const order = await validateAndGetOrder(orderId);
  const user = await currentUser();
  const changedBy = user?.emailAddresses?.[0]?.emailAddress || user?.id || "Authorized Admin";

  const historyEntry = {
    _key: crypto.randomUUID(),
    status,
    note: note?.trim() || `Status updated to ${status}`,
    changedBy,
    changedAt: new Date().toISOString(),
  };

  const patch = writeClient
    .patch(order._id)
    .ifRevisionId(order._rev)
    .set({ status })
    .setIfMissing({ statusHistory: [] })
    .append("statusHistory", [historyEntry]);

  await commitOrderMutation(patch);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order._id}`);
  return { success: true };
};

export const cancelOrderAction = async (orderId: string, reason: string) => {
  await requirePermission(permissions.orders_update);

  if (!reason?.trim()) {
    throw new Error("A cancellation reason is required.");
  }

  const order = await validateAndGetOrder(orderId);
  const user = await currentUser();
  const changedBy = user?.emailAddresses?.[0]?.emailAddress || user?.id || "Authorized Admin";

  const historyEntry = {
    _key: crypto.randomUUID(),
    status: "cancelled",
    note: `Order cancelled. Reason: ${reason.trim()}`,
    changedBy,
    changedAt: new Date().toISOString(),
  };

  const patch = writeClient
    .patch(order._id)
    .ifRevisionId(order._rev)
    .set({ status: "cancelled" })
    .setIfMissing({ statusHistory: [] })
    .append("statusHistory", [historyEntry]);

  await commitOrderMutation(patch);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order._id}`);
  return { success: true };
};

export const updatePaymentStatus = async (
  orderId: string,
  paymentStatus: "pending" | "paid" | "failed" | "refunded",
  note?: string,
  paymentReference?: string
) => {
  await requirePermission(permissions.orders_update);
  if (
    !VALID_PAYMENT_STATUSES.includes(
      paymentStatus as (typeof VALID_PAYMENT_STATUSES)[number]
    )
  ) {
    throw new Error("Invalid payment status.");
  }

  const order = await validateAndGetOrder(orderId);
  const user = await currentUser();
  const changedBy = user?.emailAddresses?.[0]?.emailAddress || user?.id || "Authorized Admin";

  const suppliedNote = note?.trim();

  const defaultNote =
    `Payment status marked as ${paymentStatus}${paymentReference ? ` (Ref: ${paymentReference})` : ""}`;

  const historyEntry = {
    _key: crypto.randomUUID(),
    status: `payment_${paymentStatus}`,
    note:
      paymentStatus === "refunded"
        ? `${suppliedNote || "Refund status updated by administrator"}. Internal Sanity status only; this action does not execute or verify a payment gateway refund.`
        : suppliedNote || defaultNote,
    changedBy,
    changedAt: new Date().toISOString(),
  };

  let patch = writeClient
    .patch(order._id)
    .ifRevisionId(order._rev)
    .set({ paymentStatus })
    .setIfMissing({ statusHistory: [] })
    .append("statusHistory", [historyEntry]);

  if (paymentReference?.trim()) {
    patch = patch.set({ paymentReference: paymentReference.trim() });
  }

  await commitOrderMutation(patch);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order._id}`);
  revalidatePath("/admin/transactions");
  return { success: true };
};

export const initiateOrderRefundAction = async (orderId: string, reason: string) => {
  await requirePermission(permissions.orders_update);

  if (!reason?.trim()) {
    throw new Error("A reason for the refund is required.");
  }

  const order = await validateAndGetOrder(orderId);
  const user = await currentUser();
  const changedBy = user?.emailAddresses?.[0]?.emailAddress || user?.id || "Authorized Admin";

  const historyEntry = {
    _key: crypto.randomUUID(),
    status: "refund_recorded",
    note: `Internal refund record logged: ${reason.trim()} (Note: manual verification in payment provider required; funds are not automatically returned by this status update)`,
    changedBy,
    changedAt: new Date().toISOString(),
  };

  const patch = writeClient
    .patch(order._id)
    .ifRevisionId(order._rev)
    .set({ paymentStatus: "refunded" })
    .setIfMissing({ statusHistory: [] })
    .append("statusHistory", [historyEntry]);

  await commitOrderMutation(patch);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order._id}`);
  revalidatePath("/admin/transactions");
  return { success: true };
};
