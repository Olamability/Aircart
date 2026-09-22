import React from "react";
import { TrendingUp, Layers, Users, ShoppingCart, Store } from "lucide-react";
import { getAdminDashboardStats, getAdminCategories } from "@/sanity/queries/adminQueries";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";

const SuperAdminMetricsPage = async () => {
  const [stats, categories] = await Promise.all([
    getAdminDashboardStats(),
    getAdminCategories(),
  ]);

  return (
    <div className="space-y-8 pb-12">
      <DashboardHeader
        title="Platform Metrics & Analytics"
        description="Comprehensive macro performance indicators across marketplace buyers, merchants, and catalog categories."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Catalog Scale"
          value={stats.totalProducts}
          icon={ShoppingCart}
          color="green"
          description="Total active product listings"
        />
        <StatsCard
          title="Merchant Base"
          value={stats.activeVendors}
          icon={Store}
          color="blue"
          description="Approved active vendors"
        />
        <StatsCard
          title="Customer Volume"
          value={stats.totalCustomers}
          icon={Users}
          color="purple"
          description="Unique paying buyers"
        />
        <StatsCard
          title="Order Records"
          value={stats.totalOrders}
          icon={TrendingUp}
          color="amber"
          description="Total order transactions"
        />
      </div>

      {/* Category Distribution Breakdown */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Layers className="h-5 w-5 text-emerald-600" />
          Catalog Distribution by Category
        </h3>

        {categories.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No categories registered.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat: any) => {
              const pct = stats.totalProducts
                ? Math.round((cat.productCount / stats.totalProducts) * 100)
                : 0;

              return (
                <div
                  key={cat._id}
                  className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 space-y-2"
                >
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-900 truncate">{cat.title}</span>
                    <span className="text-xs font-mono font-bold text-slate-600">
                      {cat.productCount} items
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-shop-dark-green transition-all duration-500"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">{pct}% of catalog</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminMetricsPage;
