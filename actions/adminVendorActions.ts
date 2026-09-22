"use server";

import { writeClient } from "@/sanity/lib/writeClient";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export const approveVendor = async (vendorId: string) => {
  await requirePermission(permissions.vendors_approve);

  await writeClient.patch(vendorId).set({ status: "approved" }).commit();

  revalidatePath("/admin/vendors");
  revalidatePath("/admin/approvals");
  revalidatePath(`/admin/vendors/${vendorId}`);
  return { success: true };
};

export const suspendVendor = async (vendorId: string) => {
  await requirePermission(permissions.vendors_suspend);

  await writeClient.patch(vendorId).set({ status: "suspended" }).commit();

  revalidatePath("/admin/vendors");
  revalidatePath("/admin/compliance");
  revalidatePath(`/admin/vendors/${vendorId}`);
  return { success: true };
};

export const updateVendorAdmin = async (
  vendorId: string,
  data: {
    businessName?: string;
    description?: string;
    status?: "pending" | "approved" | "suspended";
  }
) => {
  await requirePermission(permissions.vendors_update);

  await writeClient.patch(vendorId).set(data).commit();

  revalidatePath("/admin/vendors");
  revalidatePath(`/admin/vendors/${vendorId}`);
  return { success: true };
};
