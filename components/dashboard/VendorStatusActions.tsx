"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { CheckCircle, Ban, Eye, RotateCcw } from "lucide-react";
import { approveVendor, suspendVendor, reinstateVendorAction } from "@/actions/adminVendorActions";

interface VendorStatusActionsProps {
  vendorId: string;
  vendorName: string;
  currentStatus: string;
}

const VendorStatusActions: React.FC<VendorStatusActionsProps> = ({
  vendorId,
  vendorName,
  currentStatus,
}) => {
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      try {
        await approveVendor(vendorId);
      } catch (err) {
        alert("Failed to approve vendor: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    });
  };

  const handleSuspend = () => {
    if (!confirm(`Are you sure you want to suspend vendor "${vendorName}"? Their products will be hidden.`)) {
      return;
    }
    startTransition(async () => {
      try {
        await suspendVendor(vendorId);
      } catch (err) {
        alert("Failed to suspend vendor: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    });
  };

  const handleReinstate = () => {
    if (!confirm(`Are you sure you want to reinstate vendor "${vendorName}"?`)) {
      return;
    }
    startTransition(async () => {
      try {
        await reinstateVendorAction(vendorId);
      } catch (err) {
        alert("Failed to reinstate vendor: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link
        href={`/admin/vendors/${vendorId}`}
        title="View Vendor Details"
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
      >
        <Eye className="h-3.5 w-3.5" />
        View
      </Link>

      {currentStatus !== "approved" && currentStatus !== "suspended" && (
        <button
          type="button"
          onClick={handleApprove}
          disabled={isPending}
          title="Approve Vendor"
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition disabled:opacity-50"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          Approve
        </button>
      )}

      {currentStatus === "suspended" && (
        <button
          type="button"
          onClick={handleReinstate}
          disabled={isPending}
          title="Reinstate Vendor"
          className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-sky-700 transition disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reinstate
        </button>
      )}

      {currentStatus !== "suspended" && currentStatus !== "rejected" && (
        <button
          type="button"
          onClick={handleSuspend}
          disabled={isPending}
          title="Suspend Vendor"
          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
        >
          <Ban className="h-3.5 w-3.5" />
          Suspend
        </button>
      )}
    </div>
  );
};

export default VendorStatusActions;
