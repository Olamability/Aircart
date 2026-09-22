"use client";

import React, { useTransition } from "react";
import { updateOrderStatus, updatePaymentStatus } from "@/actions/adminOrderActions";

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
}

const OrderStatusSelect: React.FC<OrderStatusSelectProps> = ({
  orderId,
  currentStatus,
  currentPaymentStatus,
}) => {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: any) => {
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, newStatus);
      } catch (err) {
        alert("Failed to update status: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    });
  };

  const handlePaymentChange = (newPaymentStatus: any) => {
    startTransition(async () => {
      try {
        await updatePaymentStatus(orderId, newPaymentStatus);
      } catch (err) {
        alert("Failed to update payment: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Fulfillment Status
        </label>
        <select
          disabled={isPending}
          value={currentStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-hidden disabled:opacity-50"
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Payment Status
        </label>
        <select
          disabled={isPending}
          value={currentPaymentStatus}
          onChange={(e) => handlePaymentChange(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-hidden disabled:opacity-50"
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>
    </div>
  );
};

export default OrderStatusSelect;
