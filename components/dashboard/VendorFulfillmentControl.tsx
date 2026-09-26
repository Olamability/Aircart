"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { updateVendorShippingStatus } from "@/actions/vendorInventoryActions";
import StatusBadge from "@/components/dashboard/StatusBadge";

type ShippingStatus =
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered";

interface VendorFulfillmentControlProps {
  orderId: string;
  currentStatus: string;
}

const STATUS_TRANSITIONS: Record<
  string,
  { value: ShippingStatus; label: string }[]
> = {
  pending: [
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "out_for_delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
  ],
  processing: [
    { value: "shipped", label: "Shipped" },
    { value: "out_for_delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
  ],
  shipped: [
    { value: "out_for_delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
  ],
  out_for_delivery: [{ value: "delivered", label: "Delivered" }],
  delivered: [],
  cancelled: [],
};

const formatStatusLabel = (status: string) => {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const VendorFulfillmentControl: React.FC<VendorFulfillmentControlProps> = ({
  orderId,
  currentStatus,
}) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const normalizedStatus = (currentStatus || "pending").toLowerCase();
  const availableOptions = STATUS_TRANSITIONS[normalizedStatus] ?? [];

  // Note: order.status is currently stored at the order level in the Sanity schema.
  // Updating this status updates the overall order fulfillment status.
  const handleStatusChange = (newStatus: ShippingStatus) => {
    if (newStatus === normalizedStatus) return;

    startTransition(async () => {
      try {
        await updateVendorShippingStatus(orderId, newStatus);
        toast.success(`Order status updated to ${formatStatusLabel(newStatus)}`);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Failed to update order fulfillment status"
        );
      }
    });
  };

  if (normalizedStatus === "delivered") {
    return (
      <div className="flex items-center gap-1.5">
        <StatusBadge status="delivered" />
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          Fulfilled
        </span>
      </div>
    );
  }

  if (normalizedStatus === "cancelled") {
    return <StatusBadge status="cancelled" />;
  }

  if (availableOptions.length === 0) {
    return <StatusBadge status={normalizedStatus} />;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge status={normalizedStatus} />

      <div className="relative inline-flex items-center">
        <select
          disabled={isPending}
          value={normalizedStatus}
          onChange={(e) => handleStatusChange(e.target.value as ShippingStatus)}
          className="rounded-lg border border-slate-300 bg-white py-1 pl-2.5 pr-7 text-xs font-medium text-slate-700 hover:border-slate-400 focus:border-emerald-500 focus:outline-hidden disabled:opacity-50 cursor-pointer transition shadow-2xs"
          aria-label="Update fulfillment status"
        >
          <option value={normalizedStatus} disabled>
            {isPending ? "Updating..." : "Update status..."}
          </option>
          {availableOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Mark as {opt.label}
            </option>
          ))}
        </select>
        {isPending && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500 absolute right-2 pointer-events-none" />
        )}
      </div>
    </div>
  );
};

export default VendorFulfillmentControl;
