import React from "react";
import Link from "next/link";
import { Wallet, Percent, DollarSign, Users, ArrowRight, Store, Building } from "lucide-react";
import { getSuperAdminCommissionAndLedgerReport } from "@/sanity/queries/adminQueries";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import { ExportLedgerButton } from "@/components/dashboard/ExportLedgerButton";
import { PermissionGuard } from "@/lib/permissionGuard";
import { permissions } from "@/lib/permissions";

interface SuperAdminLedgerPageProps {
  searchParams: Promise<{ query?: string; status?: string }>;
}

const SuperAdminLedgerPage = async ({ searchParams }: SuperAdminLedgerPageProps) => {
  const sp = await searchParams;
  const report = await getSuperAdminCommissionAndLedgerReport();

  const filteredVendors = report.vendors.filter((v) => {
    if (sp.query && sp.query.trim()) {
      const q = sp.query.toLowerCase().trim();
      const matchName = v.businessName.toLowerCase().includes(q);
      const matchEmail = v.email.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }
    if (sp.status && sp.status !== "all") {
      if (v.status !== sp.status) return false;
    }
    return true;
  });

  return (
    <PermissionGuard permission={permissions.platform_fees}>
      <div className="space-y-6 pb-12">
        <DashboardHeader
          title="Commission, Ledger & Settlement Control"
          description="Dedicated financial control room for platform take-rates (5.0%), merchant balances, and cleared order settlement reconciliation."
        >
          <ExportLedgerButton vendors={report.vendors} />
        </DashboardHeader>

        {/* Global Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Cleared GMV"
            value={`₦${report.totalGross.toLocaleString()}`}
            icon={DollarSign}
            color="green"
            description={`From ${report.clearedTransactionsCount} cleared transactions`}
          />
          <StatsCard
            title="Marketplace Take (5%)"
            value={`₦${report.totalCommission.toLocaleString()}`}
            icon={Percent}
            color="green"
            description="5.0% platform take-rate revenue"
          />
          <StatsCard
            title="Net Merchant Payables"
            value={`₦${report.totalNetPayable.toLocaleString()}`}
            icon={Wallet}
            color="blue"
            description="Net vendor earnings balance"
          />
          <StatsCard
            title="Active Ledgers"
            value={report.vendors.length}
            icon={Users}
            color="purple"
            description="Vendors & platform inventory accounts"
          />
        </div>

        {/* Per-Vendor Financial Ledger Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Merchant Accounts Ledger</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every merchant balance is calculated against server-verified paid orders with 5% platform deduction.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg self-start sm:self-center">
              {filteredVendors.length} Merchant Account{filteredVendors.length === 1 ? "" : "s"}
            </span>
          </div>

          {filteredVendors.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Wallet}
                title="No vendor ledgers found"
                description="Merchant ledgers populate automatically when vendor applications are created and customer orders clear."
              />
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5">Merchant Account</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-center">Cleared Orders</th>
                      <th className="px-4 py-3.5 text-center">Units Sold</th>
                      <th className="px-4 py-3.5 font-mono">Gross Sales</th>
                      <th className="px-4 py-3.5 font-mono text-emerald-700">Commission (5%)</th>
                      <th className="px-4 py-3.5 font-mono font-bold text-slate-900">Net Payable</th>
                      <th className="px-5 py-3.5 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVendors.map((vendor) => {
                      const isPlatform = vendor.vendorId === "platform";

                      return (
                        <tr
                          key={vendor.vendorId}
                          className={`hover:bg-slate-50/75 transition ${
                            isPlatform ? "bg-emerald-50/20" : ""
                          }`}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              {isPlatform ? (
                                <Building className="h-4 w-4 text-shop-dark-green shrink-0" />
                              ) : (
                                <Store className="h-4 w-4 text-slate-400 shrink-0" />
                              )}
                              <div>
                                <span className="font-medium text-slate-900 block">
                                  {vendor.businessName}
                                </span>
                                <span className="text-xs text-slate-400 block truncate max-w-[180px]">
                                  {vendor.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <StatusBadge status={vendor.status} />
                          </td>

                          <td className="px-4 py-4 text-center font-mono text-xs text-slate-700">
                            {vendor.clearedOrdersCount}
                          </td>

                          <td className="px-4 py-4 text-center font-mono text-xs text-slate-700">
                            {vendor.totalUnitsSold}
                          </td>

                          <td className="px-4 py-4 font-mono font-semibold text-slate-900">
                            ₦{vendor.grossSales.toLocaleString()}
                          </td>

                          <td className="px-4 py-4 font-mono font-medium text-emerald-700">
                            {isPlatform ? "—" : `₦${vendor.platformCommission.toLocaleString()}`}
                          </td>

                          <td className="px-4 py-4 font-mono font-bold text-shop-dark-green">
                            ₦{vendor.netVendorBalance.toLocaleString()}
                          </td>

                          <td className="px-5 py-4 text-right">
                            {!isPlatform ? (
                              <Link
                                href={`/super-admin/approvals/${vendor.vendorId}`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-shop-dark-green hover:underline"
                              >
                                View Account <ArrowRight className="h-3 w-3" />
                              </Link>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Direct platform</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredVendors.map((vendor) => {
                  const isPlatform = vendor.vendorId === "platform";

                  return (
                    <div key={vendor.vendorId} className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 text-sm">
                              {vendor.businessName}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{vendor.email}</p>
                        </div>
                        <StatusBadge status={vendor.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-2 text-slate-600">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Cleared Orders:</span>
                          <span className="font-semibold text-slate-800">{vendor.clearedOrdersCount}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Gross Sales:</span>
                          <span className="font-mono font-bold text-slate-900">
                            ₦{vendor.grossSales.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-2">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Commission (5%):</span>
                          <span className="font-mono font-semibold text-emerald-700">
                            {isPlatform ? "—" : `₦${vendor.platformCommission.toLocaleString()}`}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[11px]">Net Payable:</span>
                          <span className="font-mono font-bold text-shop-dark-green text-sm">
                            ₦{vendor.netVendorBalance.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {!isPlatform && (
                        <div className="pt-1 text-right">
                          <Link
                            href={`/super-admin/approvals/${vendor.vendorId}`}
                            className="text-xs font-semibold text-shop-dark-green hover:underline"
                          >
                            View Account →
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
};

export default SuperAdminLedgerPage;
