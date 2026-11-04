import React from "react";
import { AlertCircle, Store, Clock, CheckCircle2, XCircle, Ban } from "lucide-react";
import { PermissionGuard } from "@/lib/permissionGuard";
import { permissions } from "@/lib/permissions";
import { getAdminApprovals } from "@/sanity/queries/adminQueries";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ApprovalsTabView from "@/components/dashboard/SuperAdminApprovalsTabView";

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

interface ApprovalsData {
  pendingVendors: VendorRow[];
  suspendedVendors: VendorRow[];
  rejectedVendors: VendorRow[];
  approvedVendors: VendorRow[];
  counts: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
  };
}

const SuperAdminApprovalsPage = async () => {
  const data = (await getAdminApprovals()) as ApprovalsData;
  const { pendingVendors, suspendedVendors, rejectedVendors, approvedVendors, counts } = data;

  const kpis = [
    { label: "Total Applications", value: counts.total, icon: Store, color: "text-slate-600 bg-slate-100", urgent: false },
    { label: "Pending Review", value: counts.pending, icon: Clock, color: "text-amber-700 bg-amber-100", urgent: counts.pending > 0 },
    { label: "Approved", value: counts.approved, icon: CheckCircle2, color: "text-emerald-700 bg-emerald-100", urgent: false },
    { label: "Rejected", value: counts.rejected, icon: XCircle, color: "text-rose-700 bg-rose-100", urgent: false },
    { label: "Suspended", value: counts.suspended, icon: Ban, color: "text-orange-700 bg-orange-100", urgent: false },
  ];

  return (
    <PermissionGuard permission={permissions.approvals_view}>
      <div className="space-y-6 pb-12">
        <DashboardHeader
          title="Vendor Application Management"
          description="Review, approve, reject and manage all vendor applications across the platform."
          badge={
            counts.pending > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
                <AlertCircle className="h-3.5 w-3.5" />
                {counts.pending} pending
              </span>
            ) : undefined
          }
        />

        {/* KPI bar */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <div
                key={k.label}
                className={`rounded-xl border bg-white p-4 shadow-xs space-y-2 ${k.urgent ? "border-amber-300 ring-1 ring-amber-200" : "border-slate-200"}`}
              >
                <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${k.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{k.value}</p>
                <p className="text-xs text-slate-500">{k.label}</p>
              </div>
            );
          })}
        </div>

        <ApprovalsTabView
          pendingVendors={pendingVendors}
          approvedVendors={approvedVendors}
          rejectedVendors={rejectedVendors}
          suspendedVendors={suspendedVendors}
          counts={counts}
        />
      </div>
    </PermissionGuard>
  );
};

export default SuperAdminApprovalsPage;
