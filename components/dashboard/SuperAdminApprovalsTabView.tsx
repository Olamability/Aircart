"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Store,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Eye,
  AlertCircle,
  LucideIcon,
} from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";

interface VendorRow {
  _id: string;
  businessName: string;
  email: string;
  logo?: { asset?: { _ref: string } };
  status: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt?: string;
}

interface ApprovalsTabViewProps {
  pendingVendors: VendorRow[];
  approvedVendors: VendorRow[];
  rejectedVendors: VendorRow[];
  suspendedVendors: VendorRow[];
  counts: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
  };
}

const fmt = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

function VendorLogo({ vendor }: { vendor: VendorRow }) {
  const logoUrl =
    vendor.logo?.asset ? urlFor(vendor.logo).width(48).height(48).url() : null;
  return (
    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={vendor.businessName}
          fill
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-slate-400">
          <Store className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}

function VendorTable({
  vendors,
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptyDesc,
}: {
  vendors: VendorRow[];
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDesc: string;
}) {
  if (vendors.length === 0) {
    return (
      <EmptyState
        icon={EmptyIcon}
        title={emptyTitle}
        description={emptyDesc}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 text-left">Vendor</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Submitted</th>
            <th className="px-4 py-3 text-left">Reviewed By</th>
            <th className="px-4 py-3 text-left">Reviewed At</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {vendors.map((v) => (
            <tr
              key={v._id}
              className="hover:bg-slate-50/60 transition-colors"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <VendorLogo vendor={v} />
                  <div>
                    <p className="font-medium text-slate-900">
                      {v.businessName}
                    </p>
                    <p className="text-xs text-slate-400">{v.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={v.status} />
              </td>
              <td className="px-4 py-3 text-slate-500">{fmt(v.createdAt)}</td>
              <td className="px-4 py-3 text-slate-500 text-xs">
                {v.reviewedBy ?? "—"}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {fmt(v.reviewedAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/super-admin/approvals/${v._id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Review
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type TabId = "pending" | "approved" | "rejected" | "suspended";

const ApprovalsTabView: React.FC<ApprovalsTabViewProps> = ({
  pendingVendors,
  approvedVendors,
  rejectedVendors,
  suspendedVendors,
  counts,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>("pending");

  const tabs: { id: TabId; label: string; count: number; icon: LucideIcon; urgent?: boolean }[] = [
    {
      id: "pending",
      label: "Pending",
      count: counts.pending,
      icon: Clock,
      urgent: counts.pending > 0,
    },
    {
      id: "approved",
      label: "Approved",
      count: counts.approved,
      icon: CheckCircle2,
    },
    {
      id: "rejected",
      label: "Rejected",
      count: counts.rejected,
      icon: XCircle,
    },
    {
      id: "suspended",
      label: "Suspended",
      count: counts.suspended,
      icon: Ban,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Tab bar */}
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
                <span
                  className={`ml-1 rounded-full text-xs font-bold px-2 py-0.5 ${
                    tab.urgent
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "pending" && (
        <VendorTable
          vendors={pendingVendors}
          emptyIcon={CheckCircle2}
          emptyTitle="No pending applications"
          emptyDesc="All vendor applications have been reviewed. New submissions will appear here."
        />
      )}

      {activeTab === "approved" && (
        <VendorTable
          vendors={approvedVendors}
          emptyIcon={CheckCircle2}
          emptyTitle="No approved vendors yet"
          emptyDesc="Vendors approved on this platform will be listed here."
        />
      )}

      {activeTab === "rejected" && (
        <VendorTable
          vendors={rejectedVendors}
          emptyIcon={XCircle}
          emptyTitle="No rejected applications"
          emptyDesc="Rejected vendor applications and their reasons will appear here."
        />
      )}

      {activeTab === "suspended" && (
        <VendorTable
          vendors={suspendedVendors}
          emptyIcon={Ban}
          emptyTitle="No suspended vendors"
          emptyDesc="Vendors suspended from the platform will appear here."
        />
      )}
    </div>
  );
};

export default ApprovalsTabView;

