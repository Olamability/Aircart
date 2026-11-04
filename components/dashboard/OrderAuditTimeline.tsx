import React from "react";
import { History, Clock, User, CheckCircle2, AlertCircle } from "lucide-react";

interface StatusHistoryEntry {
  status: string;
  note?: string;
  changedBy?: string;
  changedAt?: string;
}

interface OrderAuditTimelineProps {
  statusHistory?: StatusHistoryEntry[];
  createdAt?: string;
  orderStatus?: string;
  paymentStatus?: string;
}

export const OrderAuditTimeline: React.FC<OrderAuditTimelineProps> = ({
  statusHistory = [],
  createdAt,
  orderStatus,
  paymentStatus,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-emerald-600" />
          <h3 className="text-base font-semibold text-slate-900">
            Order Status Audit Trail
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {statusHistory.length} event{statusHistory.length === 1 ? "" : "s"} logged
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {/* Initial Placement Event */}
        <div className="relative">
          <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 ring-2 ring-emerald-100" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <span className="text-xs font-semibold text-slate-900">
              Order Placed by Customer
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {createdAt ? new Date(createdAt).toLocaleString() : "Initial checkout"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Initial status recorded: <span className="font-semibold text-slate-700">{orderStatus || "pending"}</span> • Payment: <span className="font-semibold text-slate-700">{paymentStatus || "pending"}</span>
          </p>
        </div>

        {/* Subsequent Audit Trail Events */}
        {statusHistory.map((item, index) => {
          const isCancelled = item.status === "cancelled";
          const isRefunded = item.status?.includes("refund");

          return (
            <div key={index} className="relative">
              <div
                className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white ring-2 ${
                  isCancelled || isRefunded
                    ? "bg-rose-500 ring-rose-100"
                    : "bg-shop-dark-green ring-emerald-100"
                }`}
              />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="text-xs font-semibold text-slate-900 capitalize">
                  Status Change: {item.status.replace(/_/g, " ")}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {item.changedAt ? new Date(item.changedAt).toLocaleString() : "—"}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {item.note || "Status updated"}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                <User className="h-3 w-3" />
                <span>Recorded by: {item.changedBy || "System Admin"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

