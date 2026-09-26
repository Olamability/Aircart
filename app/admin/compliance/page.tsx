import React from "react";
import Link from "next/link";
import { ShieldAlert, AlertOctagon, CheckCircle2, UserCheck, Ban } from "lucide-react";
import { getAdminVendors } from "@/sanity/queries/adminQueries";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import VendorStatusActions from "@/components/dashboard/VendorStatusActions";
import { PermissionGuard } from "@/lib/permissionGuard";
import { permissions } from "@/lib/permissions";

const AdminCompliancePage = async () => {
  const [allVendors] = await Promise.all([getAdminVendors()]);

  const suspendedVendors = allVendors.filter((v: any) => v.status === "suspended");
  const pendingVendors = allVendors.filter((v: any) => v.status === "pending");
  const approvedVendors = allVendors.filter((v: any) => v.status === "approved");

  return (
    <PermissionGuard permission={permissions.compliance_view}>
      <div className="space-y-8 pb-12">
      <DashboardHeader
        title="Seller Compliance & Risk Monitoring"
        description="Enforce seller code of conduct, track account flags, manage suspension policies, and audit vendor KYC credentials."
      />

      {/* Compliance Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Compliant Merchants"
          value={approvedVendors.length}
          icon={CheckCircle2}
          color="green"
          description="Verified active status"
        />
        <StatsCard
          title="KYC Under Review"
          value={pendingVendors.length}
          icon={UserCheck}
          color="amber"
          description="Awaiting documentation"
        />
        <StatsCard
          title="Suspended Accounts"
          value={suspendedVendors.length}
          icon={Ban}
          color="rose"
          description="Access restricted"
        />
      </div>

      {/* Suspended Vendors Section */}
      <div className="rounded-xl border border-rose-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-rose-800 font-semibold text-base border-b border-rose-100 pb-3">
          <ShieldAlert className="h-5 w-5 text-rose-600" />
          Suspended Merchants ({suspendedVendors.length})
        </div>

        {suspendedVendors.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            No merchant accounts are currently under platform suspension.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {suspendedVendors.map((vendor: any) => (
              <div key={vendor._id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <Link
                    href={`/admin/vendors/${vendor._id}`}
                    className="font-semibold text-slate-900 text-sm hover:underline"
                  >
                    {vendor.businessName}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">{vendor.email}</p>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status="suspended" />
                  <VendorStatusActions
                    vendorId={vendor._id}
                    vendorName={vendor.businessName}
                    currentStatus="suspended"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compliance Standards Notice */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
          <AlertOctagon className="h-4 w-4 text-slate-600" />
          Airmart Merchant Compliance Policies
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          Merchants must adhere strictly to authentic merchandise requirements, fast dispatch times (under 48 hours), verified legal business documentation, and prompt dispute resolution. Violation of marketplace counterfeit or non-delivery policies triggers automatic catalog freeze and administrative review.
        </p>
      </div>
    </div>
    </PermissionGuard>
  );
};

export default AdminCompliancePage;
