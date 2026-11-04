"use server";

import { currentUser } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/writeClient";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export interface CreateDisputeInput {
  subject: string;
  orderId?: string;
  claimantType?: "customer" | "vendor";
  claimantName: string;
  claimantEmail: string;
  reason: "non_delivery" | "damaged_item" | "wrong_item" | "refund_request" | "merchant_conduct" | "other";
  priority?: "low" | "medium" | "high" | "urgent";
  description: string;
}

export const createDisputeAction = async (data: CreateDisputeInput) => {
  await requirePermission(permissions.disputes_manage);

  if (!data.subject?.trim()) throw new Error("Subject is required");
  if (!data.claimantName?.trim()) throw new Error("Claimant name is required");
  if (!data.claimantEmail?.trim()) throw new Error("Claimant email is required");
  if (!data.description?.trim()) throw new Error("Dispute description is required");

  const doc: any = {
    _type: "dispute",
    subject: data.subject.trim(),
    claimantType: data.claimantType || "customer",
    claimantName: data.claimantName.trim(),
    claimantEmail: data.claimantEmail.trim(),
    reason: data.reason,
    priority: data.priority || "medium",
    status: "open",
    description: data.description.trim(),
    createdAt: new Date().toISOString(),
  };

  if (data.orderId) {
    doc.order = { _type: "reference", _ref: data.orderId };
  }

  const created = await writeClient.create(doc);
  revalidatePath("/admin/disputes");
  return { success: true, disputeId: created._id };
};

export const updateDisputeStatusAction = async (
  disputeId: string,
  status: "open" | "investigating" | "escalated" | "closed"
) => {
  await requirePermission(permissions.disputes_manage);
  await writeClient.patch(disputeId).set({ status }).commit();
  revalidatePath("/admin/disputes");
  return { success: true };
};

export const resolveDisputeAction = async (
  disputeId: string,
  resolutionNote: string
) => {
  await requirePermission(permissions.disputes_manage);
  if (!resolutionNote?.trim()) {
    throw new Error("Resolution note is required");
  }

  const user = await currentUser();
  const resolvedBy = user?.emailAddresses?.[0]?.emailAddress || user?.id || "Authorized Mediator";

  await writeClient
    .patch(disputeId)
    .set({
      status: "resolved",
      resolutionNote: resolutionNote.trim(),
      resolvedBy,
      resolvedAt: new Date().toISOString(),
    })
    .commit();

  revalidatePath("/admin/disputes");
  return { success: true };
};

