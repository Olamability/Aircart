import React from "react";
import Link from "next/link";
import { TrendingUp, ShoppingBag, Package, Award, UserCheck } from "lucide-react";
import { getCurrentVendor } from "@/lib/vendor";
import { getVendorTelemetry } from "@/sanity/queries/vendorQueries";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import VendorMissingProfileState from "@/components/dashboard/VendorMissingProfileState";

const VendorTelemetryPage = async () => {
  const vendor = await getCurrentVendor();

  if (!vendor) {
    return (
      <VendorMissingProfileState
        icon={TrendingUp}
        title="Merchant profile required"
        description="Please complete your merchant onboarding profile to view store analytics and telemetry."
      />
    );
  }

  if (vendor.status === "pending") {
    return (
      <div className="space-y-8 pb-12">
        <DashboardHeader
          title="Store Analytics & Telemetry"
          description="Real-time performance indicators, top converting merchandise, and sales volume analysis."
          badge={<StatusBadge status="pending" />}
        />
        <EmptyState
          icon={TrendingUp}
          title="Store telemetry inactive"
          description="Store analytics and performance indicators will activate once your merchant store is approved and sales commence."
          action={
            <Link
              href="/vendor/profile"
              className="inline-flex items-center gap-2 rounded-lg bg-shop-dark-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-shop-light-green transition"
            >
              <UserCheck className="h-4 w-4" />
              View Store Profile
            </Link>
          }
        />
      </div>
    );
  }

  const telemetry = await getVendorTelemetry(vendor._id);

  return (
    <div className="space-y-8 pb-12">
      <DashboardHeader
        title="Store Analytics & Telemetry"
        description="Real-time performance indicators, top converting merchandise, and sales volume analysis."
        badge={<StatusBadge status={vendor.status} />}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Gross Sales Revenue"
          value={`₦${telemetry.grossRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="green"
          description="Cumulative store merchandise sales"
        />
        <StatsCard
          title="Completed Store Orders"
          value={telemetry.orderCount}
          icon={ShoppingBag}
          color="blue"
          description="Orders containing your items"
        />
        <StatsCard
          title="Units Sold"
          value={telemetry.totalItemsSold}
          icon={Package}
          color="purple"
          description="Total merchandise quantity sold"
        />
      </div>

      {/* Top Performing Merchandise */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-500" />
          Top Selling Products
        </h3>

        {telemetry.topProducts.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            Analytics will populate as orders are completed and marked paid.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {telemetry.topProducts.map((prod, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{prod.title}</h4>
                    <span className="text-xs text-slate-500">{prod.count} units sold</span>
                  </div>
                </div>

                <span className="font-bold text-slate-900 text-sm">
                  ₦{prod.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorTelemetryPage;
