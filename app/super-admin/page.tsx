import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Sliders,
  Webhook,
  UserCheck,
  TrendingUp,
  Percent,
  Server,
  ArrowRight,
} from "lucide-react";
import { getAdminDashboardStats } from "@/sanity/queries/adminQueries";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";

const SuperAdminDashboardPage = async () => {
  const stats = await getAdminDashboardStats();

  return (
    <div className="space-y-8 pb-12">
      <DashboardHeader
        title="Super Admin Platform Console"
        description="Global governance, transaction fee orchestration, role delegation, and webhook infrastructure."
      />

      {/* Global Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Platform Catalog"
          value={stats.totalProducts}
          icon={Server}
          color="green"
          description="Live product nodes"
        />
        <StatsCard
          title="Verified Merchants"
          value={stats.activeVendors}
          icon={UserCheck}
          color="blue"
          description="Approved marketplace sellers"
        />
        <StatsCard
          title="Platform Order Count"
          value={stats.totalOrders}
          icon={TrendingUp}
          color="purple"
          description="All-time marketplace orders"
        />
        <StatsCard
          title="Standard Commission"
          value="5.0%"
          icon={Percent}
          color="amber"
          description="Platform base transaction fee"
        />
      </div>

      {/* Super Admin Control Modules */}
      <div>
        <h3 className="text-base font-semibold text-slate-900 mb-3">Governance Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/super-admin/metrics"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-300 hover:shadow-sm transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-shop-dark-green">
                <TrendingUp className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm">Platform Metrics</h4>
            <p className="mt-1 text-xs text-slate-500">
              Analyze macro marketplace trends, seller retention, and GMV expansion.
            </p>
          </Link>

          <Link
            href="/super-admin/fees"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-300 hover:shadow-sm transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
                <Percent className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm">Transaction Fees</h4>
            <p className="mt-1 text-xs text-slate-500">
              Configure tier-based merchant fee schedules and payout thresholds.
            </p>
          </Link>

          <Link
            href="/super-admin/admins"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-300 hover:shadow-sm transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-purple-50 text-purple-700">
                <UserCheck className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm">Admin Management</h4>
            <p className="mt-1 text-xs text-slate-500">
              Roster platform staff accounts and inspect authorization audit trails.
            </p>
          </Link>

          <Link
            href="/super-admin/roles"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-300 hover:shadow-sm transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm">Role Delegation</h4>
            <p className="mt-1 text-xs text-slate-500">
              Authority structure (Customer → Vendor → Product Manager → Admin → Super Admin).
            </p>
          </Link>

          <Link
            href="/super-admin/webhooks"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-300 hover:shadow-sm transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-teal-50 text-teal-700">
                <Webhook className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm">Global Webhooks</h4>
            <p className="mt-1 text-xs text-slate-500">
              Stripe, Paystack, and Sanity webhook listeners and event logs.
            </p>
          </Link>

          <Link
            href="/super-admin/settings"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-300 hover:shadow-sm transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700">
                <Sliders className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm">System Settings</h4>
            <p className="mt-1 text-xs text-slate-500">
              Platform-wide maintenance flags, registration toggles, and security policies.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboardPage;
