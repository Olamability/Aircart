import React from "react";
import { DollarSign, Percent, Wallet, ArrowDownRight } from "lucide-react";
import { getCurrentVendor } from "@/lib/vendor";
import { getVendorLedger } from "@/sanity/queries/vendorQueries";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import VendorMissingProfileState from "@/components/dashboard/VendorMissingProfileState";

const VendorLedgerPage = async () => {
  const vendor = await getCurrentVendor();

  if (!vendor) {
    return (
      <VendorMissingProfileState
        icon={Wallet}
        title="Merchant profile required"
        description="Please complete your merchant profile to view earnings, commission deductions, and payout history."
      />
    );
  }

  const ledger = await getVendorLedger(vendor._id);

  return (
    <div className="space-y-8 pb-12">
      <DashboardHeader
        title="Merchant Financial Ledger"
        description="Transparent breakdown of your store earnings, platform commission deductions, and pending settlement balances."
      />

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Total Gross Sales"
          value={`₦${ledger.totalGross.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          description="Cumulative order item gross"
        />
        <StatsCard
          title="Platform Fees (5%)"
          value={`₦${ledger.platformCommission.toLocaleString()}`}
          icon={Percent}
          color="amber"
          description="Marketplace processing fee"
        />
        <StatsCard
          title="Net Earnings Balance"
          value={`₦${ledger.netPayoutBalance.toLocaleString()}`}
          icon={Wallet}
          color="purple"
          description="Ready for bank transfer"
        />
      </div>

      {/* Itemized Order Transactions */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Itemized Settlement History ({ledger.transactions.length})
        </h3>

        {ledger.transactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            No sales ledger entries recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Order Ref</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Gross Total</th>
                  <th className="px-4 py-3">Commission (5%)</th>
                  <th className="px-4 py-3 text-right">Net Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledger.transactions.map((tx: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/75 transition">
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-900">
                      #{tx.orderNumber ? tx.orderNumber.slice(-8) : tx.orderId.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {tx.date
                        ? new Date(tx.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={tx.status || "paid"} />
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">
                      ₦{tx.gross.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-rose-600 font-medium">
                      -₦{tx.commission.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-emerald-700">
                      ₦{tx.net.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Security Notice */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
          <ArrowDownRight className="h-4 w-4 text-emerald-600" />
          Automated Payout Schedule
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          Marketplace net balances are settled every Tuesday directly into your registered merchant bank account. A 5% platform fee covers payment processing, customer dispute mediation, and server hosting.
        </p>
      </div>
    </div>
  );
};

export default VendorLedgerPage;
