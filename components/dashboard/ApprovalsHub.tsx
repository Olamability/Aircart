"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Store,
  ShieldCheck,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import EmptyState from "@/components/dashboard/EmptyState";
import {
  approveVendor,
  rejectVendorAction,
  requestVendorChangesAction,
  reinstateVendorAction,
} from "@/actions/adminVendorActions";

interface VendorItem {
  _id: string;
  businessName: string;
  email: string;
  logo?: { asset?: { _ref: string } };
  description?: string;
  status: string;
  rejectionReason?: string;
  reviewerNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt?: string;
}

interface ApprovalsHubProps {
  pendingVendors: VendorItem[];
  suspendedVendors: VendorItem[];
  rejectedVendors?: VendorItem[];
}

function VendorCard({ vendor }: { vendor: VendorItem }) {
  const [isPending, startTransition] = useTransition();
  const [activeInput, setActiveInput] = useState<"reject" | "changes" | null>(null);
  const [inputText, setInputText] = useState("");
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const logoUrl = vendor.logo?.asset ? urlFor(vendor.logo).width(64).height(64).url() : null;

  const run = (fn: () => Promise<unknown>, successMsg: string) => {
    setFeedback(null);
    startTransition(async () => {
      try {
        await fn();
        setFeedback({ type: "success", msg: successMsg });
        setActiveInput(null);
        setInputText("");
      } catch (e) {
        setFeedback({ type: "error", msg: e instanceof Error ? e.message : "Action failed." });
      }
    });
  };

  const handleApprove = () => {
    if (!confirm(`Approve "${vendor.businessName}"?`)) return;
    run(() => approveVendor(vendor._id), "Vendor approved.");
  };
  const handleReject = () => {
    if (!inputText.trim()) { setFeedback({ type: "error", msg: "Rejection reason required." }); return; }
    run(() => rejectVendorAction(vendor._id, inputText), "Application rejected.");
  };
  const handleRequestChanges = () => {
    if (!inputText.trim()) { setFeedback({ type: "error", msg: "Please describe required changes." }); return; }
    run(() => requestVendorChangesAction(vendor._id, inputText), "Change request sent.");
  };
  const handleReinstate = () => {
    if (!confirm(`Reinstate "${vendor.businessName}"?`)) return;
    run(() => reinstateVendorAction(vendor._id), "Vendor reinstated.");
  };

  const isSuspended = vendor.status === "suspended";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col gap-4">
      <div className="flex items-start gap-3.5">
        <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shrink-0">
          {logoUrl ? (
            <Image src={logoUrl} alt={vendor.businessName} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <Store className="h-6 w-6" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-900 text-sm truncate">{vendor.businessName}</h4>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${isSuspended ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
              {isSuspended ? <Ban className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
              {isSuspended ? "Suspended" : "Pending"}
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate mt-0.5">{vendor.email}</p>
          <p className="text-xs text-slate-600 mt-2 line-clamp-2">
            {vendor.description || "No business description provided."}
          </p>
        </div>
      </div>

      {vendor.reviewerNote && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <strong>Changes requested:</strong> {vendor.reviewerNote}
        </div>
      )}

      {feedback && (
        <p className={`text-xs rounded px-2 py-1 ${feedback.type === "error" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
          {feedback.msg}
        </p>
      )}

      {isPending && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing…
        </div>
      )}

      {/* Input panels */}
      {activeInput === "reject" && (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Rejection reason (required)…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-rose-400 resize-none"
          />
          <div className="flex gap-1.5">
            <button onClick={handleReject} disabled={isPending} className="flex-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition">Confirm Reject</button>
            <button onClick={() => setActiveInput(null)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition">Cancel</button>
          </div>
        </div>
      )}

      {activeInput === "changes" && (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe required changes…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-amber-400 resize-none"
          />
          <div className="flex gap-1.5">
            <button onClick={handleRequestChanges} disabled={isPending} className="flex-1 rounded-lg bg-amber-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition">Send Request</button>
            <button onClick={() => setActiveInput(null)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition">Cancel</button>
          </div>
        </div>
      )}

      <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[11px] text-slate-400">
          Applied: {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : "Recently"}
        </span>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <Link
            href={`/admin/vendors/${vendor._id}`}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            View
          </Link>

          {!isSuspended && (
            <>
              <button
                onClick={handleApprove}
                disabled={isPending}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
              </button>
              <button
                onClick={() => setActiveInput(activeInput === "changes" ? null : "changes")}
                disabled={isPending}
                className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50 transition"
              >
                <MessageSquare className="h-3.5 w-3.5" /> Changes
              </button>
              <button
                onClick={() => setActiveInput(activeInput === "reject" ? null : "reject")}
                disabled={isPending}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition"
              >
                <XCircle className="h-3.5 w-3.5" /> Reject
              </button>
            </>
          )}

          {isSuspended && (
            <button
              onClick={handleReinstate}
              disabled={isPending}
              className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-50 transition"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Reinstate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const ApprovalsHub: React.FC<ApprovalsHubProps> = ({
  pendingVendors,
  suspendedVendors,
  rejectedVendors = [],
}) => {
  const [activeTab, setActiveTab] = useState<"vendors" | "suspended" | "rejected" | "products" | "services" | "documents">("vendors");

  const tabs = [
    { id: "vendors" as const, label: "Pending", count: pendingVendors.length, icon: Store },
    { id: "suspended" as const, label: "Suspended", count: suspendedVendors.length, icon: Ban },
    { id: "rejected" as const, label: "Rejected", count: rejectedVendors.length, icon: XCircle },
    { id: "products" as const, label: "Product Reviews", count: 0, icon: ShieldCheck },
    { id: "services" as const, label: "Service Applications", count: 0, icon: Sparkles },
    { id: "documents" as const, label: "Document Reviews", count: 0, icon: FileText },
  ];

  const renderGrid = (vendors: VendorItem[], emptyTitle: string, emptyDesc: string) => {
    if (vendors.length === 0) {
      return <EmptyState icon={CheckCircle2} title={emptyTitle} description={emptyDesc} />;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vendors.map((v) => <VendorCard key={v._id} vendor={v} />)}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-5 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                isActive
                  ? "border-emerald-600 text-shop-dark-green font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="ml-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "vendors" &&
        renderGrid(pendingVendors, "All caught up!", "There are currently no vendor applications pending review.")}
      {activeTab === "suspended" &&
        renderGrid(suspendedVendors, "No suspended vendors", "Suspended vendor accounts will appear here.")}
      {activeTab === "rejected" &&
        renderGrid(rejectedVendors, "No rejected applications", "Rejected vendor applications will appear here.")}
      {activeTab === "products" && <EmptyState icon={ShieldCheck} title="Product Approvals Clear" description="Flagged or pending products will queue here." />}
      {activeTab === "services" && <EmptyState icon={Sparkles} title="No Service Applications" description="Service provider applications will queue here." />}
      {activeTab === "documents" && <EmptyState icon={FileText} title="Document Review Queue Empty" description="Tax registrations and business permits will appear here." />}
    </div>
  );
};

export default ApprovalsHub;
