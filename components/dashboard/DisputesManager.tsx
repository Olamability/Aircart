"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  MessageSquareWarning,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  X,
  Loader2,
} from "lucide-react";
import {
  createDisputeAction,
  updateDisputeStatusAction,
  resolveDisputeAction,
  type CreateDisputeInput,
} from "@/actions/adminDisputeActions";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";

interface DisputeItem {
  _id: string;
  subject: string;
  claimantType?: string;
  claimantName: string;
  claimantEmail: string;
  reason: string;
  priority?: string;
  status: string;
  description: string;
  resolutionNote?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  order?: {
    _id: string;
    orderNumber?: string;
    totalPrice?: number;
  };
}

interface DisputesManagerProps {
  disputes: DisputeItem[];
}

export const DisputesManager: React.FC<DisputesManagerProps> = ({ disputes: initialDisputes }) => {
  const [disputes, setDisputes] = useState(initialDisputes);
  const [showCreate, setShowCreate] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [isPending, startTransition] = useTransition();

  // Create form state
  const [subject, setSubject] = useState("");
  const [orderId, setOrderId] = useState("");
  const [claimantType, setClaimantType] = useState<"customer" | "vendor">("customer");
  const [claimantName, setClaimantName] = useState("");
  const [claimantEmail, setClaimantEmail] = useState("");
  const [reason, setReason] = useState<CreateDisputeInput["reason"]>("non_delivery");
  const [priority, setPriority] = useState<CreateDisputeInput["priority"]>("medium");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const res = await createDisputeAction({
          subject,
          orderId: orderId.trim() || undefined,
          claimantType,
          claimantName,
          claimantEmail,
          reason,
          priority,
          description,
        });

        if (res.success) {
          setShowCreate(false);
          // reload window or push state
          window.location.reload();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to log claim");
      }
    });
  };

  const handleUpdateStatus = (id: string, newStatus: "open" | "investigating" | "escalated" | "closed") => {
    startTransition(async () => {
      try {
        await updateDisputeStatusAction(id, newStatus);
        setDisputes((prev) =>
          prev.map((d) => (d._id === id ? { ...d, status: newStatus } : d))
        );
      } catch (err) {
        alert("Failed to update status: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    });
  };

  const handleResolve = (id: string) => {
    if (!resolutionNote.trim()) {
      alert("Please enter a resolution note before resolving.");
      return;
    }

    startTransition(async () => {
      try {
        await resolveDisputeAction(id, resolutionNote);
        setDisputes((prev) =>
          prev.map((d) =>
            d._id === id
              ? {
                  ...d,
                  status: "resolved",
                  resolutionNote: resolutionNote.trim(),
                  resolvedAt: new Date().toISOString(),
                }
              : d
          )
        );
        setResolvingId(null);
        setResolutionNote("");
      } catch (err) {
        alert("Failed to resolve dispute: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-shop-dark-green px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-shop-light-green transition"
        >
          <Plus className="h-4 w-4" />
          {showCreate ? "Close Form" : "Log New Claim / Ticket"}
        </button>
      </div>

      {/* Log Claim Form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-4 animate-in fade-in"
        >
          <h4 className="font-semibold text-slate-900 text-sm">Open Customer / Vendor Dispute Claim</h4>
          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700">Subject *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Package damaged in transit"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700">Claimant Type</label>
              <select
                value={claimantType}
                onChange={(e) => setClaimantType(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="customer">Buyer / Customer</option>
                <option value="vendor">Merchant / Vendor</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700">Claimant Name *</label>
              <input
                type="text"
                required
                value={claimantName}
                onChange={(e) => setClaimantName(e.target.value)}
                placeholder="Full Name"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700">Claimant Email *</label>
              <input
                type="email"
                required
                value={claimantEmail}
                onChange={(e) => setClaimantEmail(e.target.value)}
                placeholder="email@example.com"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700">Dispute Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="non_delivery">Non-Delivery / Transit Loss</option>
                <option value="damaged_item">Damaged or Defective Item</option>
                <option value="wrong_item">Wrong Item Received</option>
                <option value="refund_request">Refund / Return Request</option>
                <option value="merchant_conduct">Merchant Conduct</option>
                <option value="other">Other / General Issue</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block font-medium text-slate-700">Description of Claim *</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details of the incident, parcel tracking context, or customer complaint..."
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-shop-dark-green px-4 py-1.5 text-xs font-semibold text-white hover:bg-shop-light-green transition disabled:opacity-50"
            >
              {isPending ? "Logging..." : "Create Dispute Ticket"}
            </button>
          </div>
        </form>
      )}

      {/* Disputes List */}
      {disputes.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <EmptyState
            icon={MessageSquareWarning}
            title="No open disputes"
            description="Buyer-seller mediation tickets, chargeback claims, and customer complaints will populate here for platform arbitration."
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Subject / Case</th>
                  <th className="px-4 py-3.5">Claimant</th>
                  <th className="px-4 py-3.5">Reason</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Logged Date</th>
                  <th className="px-5 py-3.5 text-right">Arbitration Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {disputes.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50/75 transition">
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-900 block text-xs">
                        {d.subject}
                      </span>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {d.description}
                      </p>
                      {d.order && (
                        <Link
                          href={`/admin/orders/${d.order._id}`}
                          className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] text-shop-dark-green hover:underline"
                        >
                          Order #{d.order.orderNumber?.slice(-8) || d.order._id.slice(0, 8)}
                        </Link>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-medium text-slate-900 block text-xs">
                        {d.claimantName}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[140px]">
                        {d.claimantEmail}
                      </span>
                      <span className="text-[10px] text-slate-500 capitalize">
                        ({d.claimantType || "buyer"})
                      </span>
                    </td>

                    <td className="px-4 py-4 text-xs font-medium text-slate-700 capitalize">
                      {d.reason.replace(/_/g, " ")}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          d.priority === "urgent"
                            ? "bg-rose-100 text-rose-800"
                            : d.priority === "high"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {d.priority || "medium"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={d.status} />
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(d.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {d.status === "resolved" ? (
                        <div className="text-right">
                          <span className="text-xs font-semibold text-emerald-700 flex items-center justify-end gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
                          </span>
                          {d.resolutionNote && (
                            <span className="text-[10px] text-slate-400 block truncate max-w-[160px]">
                              {d.resolutionNote}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {d.status === "open" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(d._id, "investigating")}
                              disabled={isPending}
                              className="rounded bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 text-xs font-medium transition"
                            >
                              Investigate
                            </button>
                          )}
                          {d.status !== "escalated" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(d._id, "escalated")}
                              disabled={isPending}
                              className="rounded bg-amber-50 hover:bg-amber-100 text-amber-800 px-2 py-1 text-xs font-medium transition"
                            >
                              Escalate
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setResolvingId(d._id)}
                            disabled={isPending}
                            className="rounded bg-emerald-50 hover:bg-emerald-100 text-shop-dark-green px-2.5 py-1 text-xs font-semibold transition"
                          >
                            Resolve
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {disputes.map((d) => (
              <div key={d._id} className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-slate-900 text-xs block">
                      {d.subject}
                    </span>
                    <span className="text-xs text-slate-500">{d.claimantName}</span>
                  </div>
                  <StatusBadge status={d.status} />
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{d.description}</p>

                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
                  <span className="capitalize">{d.reason.replace(/_/g, " ")}</span>
                  {d.status !== "resolved" ? (
                    <button
                      type="button"
                      onClick={() => setResolvingId(d._id)}
                      className="font-semibold text-shop-dark-green hover:underline text-xs"
                    >
                      Resolve Case →
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-semibold">Resolved</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolution Dialog */}
      {resolvingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm">Resolve Dispute Claim</h4>
              <button
                type="button"
                onClick={() => setResolvingId(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Resolution Finding & Settlement Terms *
              </label>
              <textarea
                required
                rows={4}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Enter outcome: e.g. Customer refunded, merchant issued replacement voucher, claim dismissed..."
                className="mt-1.5 w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResolvingId(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleResolve(resolvingId)}
                className="rounded-lg bg-shop-dark-green px-4 py-1.5 text-xs font-semibold text-white hover:bg-shop-light-green disabled:opacity-50"
              >
                {isPending ? "Submitting..." : "Confirm Resolution"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

