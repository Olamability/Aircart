"use server";

import { auth } from "@clerk/nextjs/server";
import { getUserRole } from "@/lib/roles";
import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";

export async function deleteOrder(orderId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "You must be signed in.",
      };
    }

    const role = await getUserRole();

    if (role !== "admin" && role !== "super_admin") {
      return {
        success: false,
        message: "Unauthorized: Only administrators can delete orders.",
      };
    }

    if (!orderId || typeof orderId !== "string" || !orderId.trim()) {
      return {
        success: false,
        message: "Invalid order ID.",
      };
    }

    const trimmedId = orderId.trim();

    if (trimmedId.startsWith("drafts.")) {
      return {
        success: false,
        message: "Cannot delete draft order documents directly.",
      };
    }

    // Fetch and verify that the target document exists and has _type == "order" before deleting
    const target = await backendClient.fetch<{
      _id: string;
      _type: string;
      _rev: string;
    } | null>(
      `*[_id == $orderId][0]{ _id, _type, _rev }`,
      { orderId: trimmedId }
    );

    if (!target) {
      return {
        success: false,
        message: "Order not found.",
      };
    }

    if (target._type !== "order") {
      return {
        success: false,
        message: "Target document is not an order.",
      };
    }

    await backendClient
      .transaction()
      .delete(target._id)
      .commit();

    revalidatePath("/admin/orders");

    return {
      success: true,
      message: "Order deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting order:", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete order",
    };
  }
}
