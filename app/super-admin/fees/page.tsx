import React from "react";
import { Percent, Wallet, DollarSign, AlertCircle, Save } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";

const SuperAdminFeesPage = () => {
  return (
    <div className="space-y-8 pb-12">
      <DashboardHeader
        title="Transaction Fees & Monetization"
        description="Set global marketplace take rates, tiered commission percentages, and merchant payout thresholds."
      />

      {/* Fee KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Base Commission"
          value="5.0%"
          icon={Percent}
          color="green"
          description="Default take rate on sold items"
        />
        <StatsCard
          title="Payout Threshold"
          value="₦5,000"
          icon={Wallet}
          color="amber"
          description="Minimum vendor settlement balance"
        />
        <StatsCard
          title="Payment Processing"
          value="1.5% + ₦100"
          icon={DollarSign}
          color="blue"
          description="Direct gateway pass-through rate"
        />
      </div>

      {/* Fee Configuration Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 max-w-3xl">
        <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Marketplace Fee Schedules
        </h3>

        <div className="space-y-5 text-sm">
          <div>
            <label className="block font-medium text-slate-700">
              Standard Marketplace Take Rate (%)
            </label>
            <p className="text-xs text-slate-500 mb-1.5">
              Deducted automatically from vendor order subtotals prior to weekly settlement.
            </p>
            <div className="relative max-w-xs">
              <input
                type="number"
                step="0.1"
                defaultValue={5.0}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-hidden"
              />
              <span className="absolute right-3 top-2 text-slate-400 text-sm font-semibold">%</span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700">
              Minimum Payout Threshold (₦)
            </label>
            <p className="text-xs text-slate-500 mb-1.5">
              Merchant balances below this amount roll over to the next payout cycle.
            </p>
            <input
              type="number"
              defaultValue={5000}
              className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700">Settlement Day</label>
            <p className="text-xs text-slate-500 mb-1.5">
              Automated platform disbursement cycle for cleared orders.
            </p>
            <select
              defaultValue="tuesday"
              className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-hidden"
            >
              <option value="monday">Every Monday</option>
              <option value="tuesday">Every Tuesday</option>
              <option value="friday">Every Friday</option>
              <option value="biweekly">Bi-Weekly (1st & 15th)</option>
            </select>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 flex justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-shop-dark-green px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-shop-light-green transition"
          >
            <Save className="h-4 w-4" />
            Update Fee Policy
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminFeesPage;
