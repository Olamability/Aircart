"use server";

import { writeClient } from "@/sanity/lib/writeClient";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";

// ─── helpers ────────────────────────────────────────────────────────────────

const REVALIDATE_PATHS = [
  "/admin/vendors",
  "/admin/approvals",
  "/super-admin/approvals",
  "/super-admin",
  "/vendor",
];

function revalidateAll(vendorId?: string) {
  for (const p of REVALIDATE_PATHS) revalidatePath(p);
  if (vendorId) {
    revalidatePath(`/admin/vendors/${vendorId}`);
    revalidatePath(`/super-admin/approvals/${vendorId}`);
  }
  revalidatePath("/admin/compliance");
}

async function getReviewerInfo(): Promise<{ userId: string; email: string }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await currentUser();
  const email =
    user?.emailAddresses?.[0]?.emailAddress ?? userId;
  return { userId, email };
}

interface VendorRecord {
  _id: string;
  clerkUserId: string;
  status: string;
}

async function fetchVendor(vendorId: string): Promise<VendorRecord> {
  const vendor = await client.fetch<VendorRecord | null>(
    `*[_type == "vendor" && _id == $vendorId][0]{ _id, clerkUserId, status }`,
    { vendorId }
  );
  if (!vendor) throw new Error("Vendor not found");
  return vendor;
}

function buildHistoryEntry(
  action: string,
  reviewedBy: string,
  reason?: string
) {
  return {
    _type: "object",
    _key: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    action,
    reason: reason ?? "",
    reviewedBy,
    reviewedAt: new Date().toISOString(),
  };
}

// ─── existing actions (preserved + enhanced) ────────────────────────────────

export const approveVendor = async (vendorId: string) => {
  await requirePermission(permissions.vendors_approve);

  const { userId, email } = await getReviewerInfo();
  const vendor = await fetchVendor(vendorId);

  // Self-approval guard
  if (vendor.clerkUserId === userId) {
    throw new Error("A vendor cannot approve their own application.");
  }

  const now = new Date().toISOString();
  const historyEntry = buildHistoryEntry("approved", email);

  await writeClient
    .patch(vendorId)
    .set({
      status: "approved",
      reviewedAt: now,
      reviewedBy: email,
      rejectionReason: "",
      reviewerNote: "",
      updatedAt: now,
    })
    .append("approvalHistory", [historyEntry])
    .commit();

  revalidateAll(vendorId);
  return { success: true };
};

export const suspendVendor = async (vendorId: string, reason?: string) => {
  await requirePermission(permissions.vendors_suspend);

  const { email } = await getReviewerInfo();
  const now = new Date().toISOString();
  const historyEntry = buildHistoryEntry(
    "suspended",
    email,
    reason ?? "Suspended by administrator"
  );

  await writeClient
    .patch(vendorId)
    .set({
      status: "suspended",
      reviewedAt: now,
      reviewedBy: email,
      ...(reason ? { rejectionReason: reason } : {}),
      updatedAt: now,
    })
    .append("approvalHistory", [historyEntry])
    .commit();

  revalidateAll(vendorId);
  return { success: true };
};

export const updateVendorAdmin = async (
  vendorId: string,
  data: {
    businessName?: string;
    description?: string;
    status?: "pending" | "approved" | "suspended" | "rejected";
  }
) => {
  await requirePermission(permissions.vendors_update);

  await writeClient
    .patch(vendorId)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .commit();

  revalidateAll(vendorId);
  return { success: true };
};

// ─── new approval workflow actions ──────────────────────────────────────────

export const rejectVendorAction = async (
  vendorId: string,
  reason: string
) => {
  await requirePermission(permissions.approvals_manage);

  const { userId, email } = await getReviewerInfo();
  const vendor = await fetchVendor(vendorId);

  if (vendor.clerkUserId === userId) {
    throw new Error("A vendor cannot reject their own application.");
  }

  if (!reason?.trim()) {
    throw new Error("A rejection reason is required.");
  }

  const now = new Date().toISOString();
  const historyEntry = buildHistoryEntry("rejected", email, reason.trim());

  await writeClient
    .patch(vendorId)
    .set({
      status: "rejected",
      rejectionReason: reason.trim(),
      reviewerNote: "",
      reviewedAt: now,
      reviewedBy: email,
      updatedAt: now,
    })
    .append("approvalHistory", [historyEntry])
    .commit();

  revalidateAll(vendorId);
  return { success: true };
};

export const requestVendorChangesAction = async (
  vendorId: string,
  note: string
) => {
  await requirePermission(permissions.approvals_manage);

  const { email } = await getReviewerInfo();

  if (!note?.trim()) {
    throw new Error("A note explaining the required changes is required.");
  }

  const now = new Date().toISOString();
  const historyEntry = buildHistoryEntry(
    "changes_requested",
    email,
    note.trim()
  );

  await writeClient
    .patch(vendorId)
    .set({
      status: "pending",
      reviewerNote: note.trim(),
      reviewedAt: now,
      reviewedBy: email,
      updatedAt: now,
    })
    .append("approvalHistory", [historyEntry])
    .commit();

  revalidateAll(vendorId);
  return { success: true };
};

export const reinstateVendorAction = async (vendorId: string) => {
  await requirePermission(permissions.vendors_approve);

  const { userId, email } = await getReviewerInfo();
  const vendor = await fetchVendor(vendorId);

  if (vendor.clerkUserId === userId) {
    throw new Error("A vendor cannot reinstate their own account.");
  }

  if (vendor.status !== "suspended") {
    throw new Error("Only suspended vendors can be reinstated.");
  }

  const now = new Date().toISOString();
  const historyEntry = buildHistoryEntry("reinstated", email);

  await writeClient
    .patch(vendorId)
    .set({
      status: "approved",
      rejectionReason: "",
      reviewerNote: "",
      reviewedAt: now,
      reviewedBy: email,
      updatedAt: now,
    })
    .append("approvalHistory", [historyEntry])
    .commit();

  revalidateAll(vendorId);
  return { success: true };
};

export const reopenVendorApplicationAction = async (vendorId: string) => {
  await requirePermission(permissions.approvals_manage);

  const { email } = await getReviewerInfo();
  const vendor = await fetchVendor(vendorId);

  if (vendor.status !== "rejected") {
    throw new Error("Only rejected applications can be reopened.");
  }

  const now = new Date().toISOString();
  const historyEntry = buildHistoryEntry(
    "reopened",
    email,
    "Application reconsidered and returned to pending review."
  );

  await writeClient
    .patch(vendorId)
    .set({
      status: "pending",
      rejectionReason: "",
      reviewerNote: "",
      reviewedAt: now,
      reviewedBy: email,
      updatedAt: now,
    })
    .append("approvalHistory", [historyEntry])
    .commit();

  revalidateAll(vendorId);
  return { success: true };
};
