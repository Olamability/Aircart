"use client";

import React, { useState, useTransition } from "react";
import { updateOrderStatus, updatePaymentStatus } from "@/actions/adminOrderActions";

type OrderFulfillmentStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

type OrderPaymentStatus = "pending" | "paid" | "failed" | "refunded";

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
  const [statusVal, setStatusVal] = useState(currentStatus);
  const [paymentVal, setPaymentVal] = useState(currentPaymentStatus);

  const handleStatusChange = (newStatus: OrderFulfillmentStatus) => {
    let note = "";
    if (newStatus === "cancelled") {
      const input = prompt("Please provide a reason for cancelling this order:", "Customer requested cancellation");
      if (input === null) return; // User pressed Cancel in prompt
      note = input;
    } else {
      const input = prompt(`Optional audit note for updating fulfillment to "${newStatus}":`, `Status moved to ${newStatus}`);
      if (input !== null) {
        note = input;
      }
    }

    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, newStatus, note);
        setStatusVal(newStatus);
      } catch (err) {
        alert("Failed to update status: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    });
  };

  const handlePaymentChange = (newPaymentStatus: OrderPaymentStatus) => {
    let note = "";
    let ref = "";

    if (newPaymentStatus === "paid") {
      const inputRef = prompt("Enter payment transaction reference (Stripe/Paystack ID or bank confirmation):", "");
      if (inputRef === null) return;
      ref = inputRef;
      note = "Payment verified and confirmed by administrator";
    } else if (newPaymentStatus === "refunded") {
      const input = prompt("Please provide the refund authorization note / reason:", "Authorized refund by administrator");
      if (input === null) return;
      note = input;
    }

    startTransition(async () => {
      try {
        await updatePaymentStatus(orderId, newPaymentStatus, note, ref);
        setPaymentVal(newPaymentStatus);
      } catch (err) {
        alert("Failed to update payment status: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Fulfillment Status
        </label>
        <select
          disabled={isPending}
          value={statusVal}
          onChange={(e) => handleStatusChange(e.target.value as OrderFulfillmentStatus)}
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
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Payment Status
        </label>
        <select
          disabled={isPending}
          value={paymentVal}
          onChange={(e) => handlePaymentChange(e.target.value as OrderPaymentStatus)}
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
