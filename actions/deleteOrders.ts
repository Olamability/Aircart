"use server";

import { auth } from "@clerk/nextjs/server";
import { backendClient } from "@/sanity/lib/backendClient";

export async function deleteOrder(orderId: string) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "You must be signed in.",
      };
    }

    const role = sessionClaims?.metadata?.role;

    if (role !== "admin") {
      return {
        success: false,
        message: "Delete method applied for Admin",
      };
    }

    await backendClient.delete(orderId);

    return {
      success: true,
      message: "Order deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting order:", error);

    return {
      success: false,
      message: "Failed to delete order",
    };
  }
}
