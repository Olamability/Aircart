import React from "react";
import Link from "next/link";
import { CreditCard, ArrowRight, DollarSign, Percent, Wallet, AlertCircle } from "lucide-react";
import { getAdminTransactions } from "@/sanity/queries/adminQueries";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import FilterBar from "@/components/dashboard/FilterBar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import { ExportTransactionsButton } from "@/components/dashboard/ExportTransactionsButton";
import { PermissionGuard } from "@/lib/permissionGuard";
import { permissions } from "@/lib/permissions";

interface AdminTransactionsPageProps {
  searchParams: Promise<{
    query?: string;
    status?: string;
    provider?: string;
  }>;
}

const AdminTransactionsPage = async ({ searchParams }: AdminTransactionsPageProps) => {
  const sp = await searchParams;
  const transactions = await getAdminTransactions({
    query: sp.query,
    status: sp.status,
    provider: sp.provider,
  });

  // Calculate platform financial totals from persisted transaction data
  const paidTransactions = transactions.filter((t: any) => t.paymentStatus === "paid");
  const totalVolume = paidTransactions.reduce((acc: number, t: any) => acc + (t.totalPrice || 0), 0);
  const platformCommission = totalVolume * 0.05; // 5% consistent take rate
  const vendorNetSettlements = totalVolume - platformCommission;
  const refundedVolume = transactions
    .filter((t: any) => t.paymentStatus === "refunded")
    .reduce((acc: number, t: any) => acc + (t.totalPrice || 0), 0);

  const filters = [
    {
      key: "provider",
      label: "Gateway",
      options: [
        { label: "Stripe", value: "stripe" },
        { label: "Paystack", value: "paystack" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Paid", value: "paid" },
        { label: "Pending", value: "pending" },
        { label: "Failed", value: "failed" },
        { label: "Refunded", value: "refunded" },
      ],
    },
  ];

  return (
    <PermissionGuard permission={permissions.transactions_view}>
      <div className="space-y-6 pb-12">
        <DashboardHeader
          title="Payment Transactions & Financials"
          description="Audit payment gateway transactions, platform commissions (5%), settlement verification, and payment reference reconciliation."
        >
          <ExportTransactionsButton transactions={transactions} />
        </DashboardHeader>

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Cleared Volume"
            value={`₦${totalVolume.toLocaleString()}`}
            icon={DollarSign}
            color="green"
            description={`${paidTransactions.length} settled transaction${paidTransactions.length === 1 ? "" : "s"}`}
          />
          <StatsCard
            title="Platform Commission (5%)"
            value={`₦${platformCommission.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            icon={Percent}
            color="green"
            description="Marketplace take rate revenue"
          />
          <StatsCard
            title="Vendor Settlements (95%)"
            value={`₦${vendorNetSettlements.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            icon={Wallet}
            color="blue"
            description="Net allocated to merchant ledgers"
          />
          <StatsCard
            title="Refunded / Chargeback"
            value={`₦${refundedVolume.toLocaleString()}`}
            icon={AlertCircle}
            color="rose"
            description="Reversed or cancelled transactions"
          />
        </div>

        <FilterBar searchPlaceholder="Search by reference, order #, customer..." filters={filters} />

        {transactions.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No transactions logged"
            description="Payment records will populate automatically upon checkout intent initialization and webhook confirmation."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Reference / Order</th>
                    <th className="px-4 py-3.5">Gateway</th>
                    <th className="px-4 py-3.5">Customer</th>
                    <th className="px-4 py-3.5">Gross Amount</th>
                    <th className="px-4 py-3.5">Commission (5%)</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Order Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx: any) => {
                    const ref = tx.paymentReference || tx.stripeCheckoutSessionId || tx._id;
                    const commission = (tx.totalPrice || 0) * 0.05;

                    return (
                      <tr key={tx._id} className="hover:bg-slate-50/75 transition">
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs font-medium text-slate-900 block truncate max-w-[180px]">
                            {ref}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Order: #{tx.orderNumber ? tx.orderNumber.slice(-8) : tx._id.slice(0, 8)}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 capitalize">
                            {tx.provider || "stripe"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-medium text-slate-900 block">{tx.customerName || "Customer"}</span>
                          <span className="text-xs text-slate-400 truncate block max-w-[160px]">
                            {tx.customerEmail}
                          </span>
                        </td>

                        <td className="px-4 py-4 font-bold text-slate-900 font-mono">
                          ₦{tx.totalPrice?.toLocaleString()}
                        </td>

                        <td className="px-4 py-4 text-xs font-semibold text-emerald-700 font-mono">
                          ₦{commission.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge status={tx.paymentStatus} />
                        </td>

                        <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                          {tx.createdAt
                            ? new Date(tx.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/admin/orders/${tx._id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-shop-dark-green hover:underline"
                          >
                            View Order <ArrowRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {transactions.map((tx: any) => {
                const commission = (tx.totalPrice || 0) * 0.05;

                return (
                  <div key={tx._id} className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-900 truncate max-w-[180px]">
                        {tx.paymentReference || tx._id.slice(0, 8)}
                      </span>
                      <span className="font-bold text-slate-900 text-sm font-mono">
                        ₦{tx.totalPrice?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{tx.customerName}</span>
                      <span className="font-medium capitalize">{tx.provider || "stripe"}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-1.5">
                      <span>Marketplace Take (5%):</span>
                      <span className="font-semibold text-emerald-700 font-mono">
                        ₦{commission.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <StatusBadge status={tx.paymentStatus} />
                      <Link
                        href={`/admin/orders/${tx._id}`}
                        className="text-xs font-semibold text-shop-dark-green hover:underline"
                      >
                        View Order →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
};

export default AdminTransactionsPage;
