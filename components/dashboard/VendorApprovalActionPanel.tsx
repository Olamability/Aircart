"use client";

import React, { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Ban,
  RotateCcw,
  MessageSquare,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  approveVendor,
  rejectVendorAction,
  requestVendorChangesAction,
  reinstateVendorAction,
  reopenVendorApplicationAction,
  suspendVendor,
} from "@/actions/adminVendorActions";

interface Props {
  vendorId: string;
  vendorName: string;
  currentStatus: string;
}

type ActionType = "approve" | "reject" | "request_changes" | "reinstate" | "reopen" | "suspend" | null;

const VendorApprovalActionPanel: React.FC<Props> = ({
  vendorId,
  vendorName,
  currentStatus,
}) => {
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  const clearFeedback = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const openAction = (action: ActionType) => {
    clearFeedback();
    setInputText("");
    setActiveAction(action);
  };

  const handleApprove = () => {
    if (!confirm(`Approve "${vendorName}"? They will gain full vendor access.`)) return;
    clearFeedback();
    startTransition(async () => {
      try {
        await approveVendor(vendorId);
        setSuccessMsg("Vendor approved successfully.");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to approve vendor.");
      }
    });
  };

  const handleReject = () => {
    if (!inputText.trim()) {
      setError("A rejection reason is required.");
      return;
    }
    clearFeedback();
    startTransition(async () => {
      try {
        await rejectVendorAction(vendorId, inputText.trim());
        setSuccessMsg("Application rejected.");
        setActiveAction(null);
        setInputText("");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to reject application.");
      }
    });
  };

  const handleRequestChanges = () => {
    if (!inputText.trim()) {
      setError("Please describe the changes required.");
      return;
    }
    clearFeedback();
    startTransition(async () => {
      try {
        await requestVendorChangesAction(vendorId, inputText.trim());
        setSuccessMsg("Change request sent to vendor.");
        setActiveAction(null);
        setInputText("");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to send change request.");
      }
    });
  };

  const handleReinstate = () => {
    if (!confirm(`Reinstate "${vendorName}"? They will regain approved vendor access.`)) return;
    clearFeedback();
    startTransition(async () => {
      try {
        await reinstateVendorAction(vendorId);
        setSuccessMsg("Vendor reinstated successfully.");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to reinstate vendor.");
      }
    });
  };

  const handleReopen = () => {
    if (!confirm(`Reopen the application for "${vendorName}"? Status will return to pending.`)) return;
    clearFeedback();
    startTransition(async () => {
      try {
        await reopenVendorApplicationAction(vendorId);
        setSuccessMsg("Application reopened and returned to pending.");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to reopen application.");
      }
    });
  };

  const handleSuspend = () => {
    if (!inputText.trim()) {
      setError("A suspension reason is required.");
      return;
    }
    clearFeedback();
    startTransition(async () => {
      try {
        await suspendVendor(vendorId, inputText.trim());
        setSuccessMsg("Vendor suspended.");
        setActiveAction(null);
        setInputText("");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to suspend vendor.");
      }
    });
  };

  const isApproved = currentStatus === "approved";
  const isPendingStatus = currentStatus === "pending" || !currentStatus;
  const isRejected = currentStatus === "rejected";
  const isSuspended = currentStatus === "suspended";

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden h-full">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
        <h3 className="text-sm font-semibold text-slate-700">Administrative Actions</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          All actions are recorded in the approval history.
        </p>
      </div>

      <div className="p-5 space-y-3">
        {/* Feedback banners */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {successMsg}
          </div>
        )}

        {/* Loading overlay */}
        {isPending && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing…
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2">
          {/* Approve — available when pending or rejected */}
          {(isPendingStatus || isRejected) && (
            <button
              onClick={handleApprove}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              Approve Application
            </button>
          )}

          {/* Request Changes — available when pending */}
          {isPendingStatus && (
            <button
              onClick={() =>
                activeAction === "request_changes"
                  ? setActiveAction(null)
                  : openAction("request_changes")
              }
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100 transition disabled:opacity-50"
            >
              <MessageSquare className="h-4 w-4" />
              Request Changes
            </button>
          )}

          {/* Reject — available when pending or approved */}
          {(isPendingStatus || isApproved) && (
            <button
              onClick={() =>
                activeAction === "reject" ? setActiveAction(null) : openAction("reject")
              }
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-800 hover:bg-rose-100 transition disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Reject Application
            </button>
          )}

          {/* Suspend — available when approved */}
          {isApproved && (
            <button
              onClick={() =>
                activeAction === "suspend" ? setActiveAction(null) : openAction("suspend")
              }
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-800 hover:bg-orange-100 transition disabled:opacity-50"
            >
              <Ban className="h-4 w-4" />
              Suspend Vendor
            </button>
          )}

          {/* Reinstate — available when suspended */}
          {isSuspended && (
            <button
              onClick={handleReinstate}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Reinstate Vendor
            </button>
          )}

          {/* Suspend (while suspended is for reinstate; suspend = new action from approved) */}
          {/* Reopen — available when rejected */}
          {isRejected && (
            <button
              onClick={handleReopen}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-violet-300 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-800 hover:bg-violet-100 transition disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Reopen Application
            </button>
          )}

          {/* Suspend from suspended state — allow re-suspend with new reason or approve */}
          {isSuspended && (
            <button
              onClick={() =>
                activeAction === "reject" ? setActiveAction(null) : openAction("reject")
              }
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-800 hover:bg-rose-100 transition disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Permanently Reject
            </button>
          )}
        </div>

        {/* Inline text panels for actions requiring input */}
        {activeAction === "reject" && (
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <label className="block text-xs font-semibold text-slate-600">
              Rejection reason <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Explain why this application is being rejected…"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-rose-400 focus:ring-1 focus:ring-rose-200 outline-none resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleReject}
                disabled={isPending || !inputText.trim()}
                className="flex-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => setActiveAction(null)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {activeAction === "request_changes" && (
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <label className="block text-xs font-semibold text-slate-600">
              Changes required <span className="text-amber-600">*</span>
            </label>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe the corrections or additional information required…"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 outline-none resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleRequestChanges}
                disabled={isPending || !inputText.trim()}
                className="flex-1 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition"
              >
                Send Change Request
              </button>
              <button
                onClick={() => setActiveAction(null)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {activeAction === "suspend" && (
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <label className="block text-xs font-semibold text-slate-600">
              Suspension reason <span className="text-orange-600">*</span>
            </label>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Explain why this vendor is being suspended…"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-200 outline-none resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSuspend}
                disabled={isPending || !inputText.trim()}
                className="flex-1 rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-50 transition"
              >
                Confirm Suspension
              </button>
              <button
                onClick={() => setActiveAction(null)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorApprovalActionPanel;

