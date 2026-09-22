import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Store,
  Package,
  ShoppingBag,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Warehouse,
  UserCheck,
} from "lucide-react";
import { getCurrentVendor } from "@/lib/vendor";
import { getVendorDashboardStats, getVendorTelemetry } from "@/sanity/queries/vendorQueries";
import { urlFor } from "@/sanity/lib/image";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";

const VendorDashboardPage = async () => {
  const vendor = await getCurrentVendor();

  if (!vendor) {
    return (
      <div className="py-12 max-w-xl mx-auto text-center space-y-4">
        <div className="h-16 w-16 bg-emerald-50 text-shop-dark-green rounded-full flex items-center justify-center mx-auto">
          <Store className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Welcome to Merchant Portal</h2>
        <p className="text-sm text-slate-500">
          Your merchant profile has not been fully configured yet. Set up your business profile to begin listing products.
        </p>
        <Link
          href="/vendor/profile"
          className="inline-flex items-center gap-2 rounded-lg bg-shop-dark-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-shop-light-green transition"
        >
          <UserCheck className="h-4 w-4" />
          Complete Store Profile
        </Link>
      </div>
    );
  }

  const [stats, telemetry] = await Promise.all([
    getVendorDashboardStats(vendor._id),
    getVendorTelemetry(vendor._id),
  ]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <DashboardHeader
        title={`${vendor.businessName} Store Overview`}
        description="Monitor your inventory levels, fulfillment orders, and store sales performance."
        badge={<StatusBadge status={vendor.status || "approved"} />}
      >
        <Link
          href="/vendor/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-shop-dark-green px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-shop-light-green transition"
        >
          <PlusCircle className="h-4 w-4" />
          Add Product
        </Link>
      </DashboardHeader>

      {/* Low stock alert banner */}
      {stats.lowStockCount > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-amber-900">
                {stats.lowStockCount} Product{stats.lowStockCount > 1 ? "s" : ""} Below 5 Units
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Replenish inventory to avoid fulfillment delays and out-of-stock delisting.
              </p>
            </div>
          </div>
          <Link
            href="/vendor/inventory"
            className="text-xs font-bold text-amber-900 underline hover:text-amber-700"
          >
            Update Stock
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Listed Products"
          value={stats.totalProducts}
          icon={Package}
          color="green"
          description="Total store inventory"
        />
        <StatsCard
          title="Active & Ready"
          value={stats.activeProducts}
          icon={TrendingUp}
          color="blue"
          description="Available on storefront"
        />
        <StatsCard
          title="Store Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          color="purple"
          description="Orders containing your items"
        />
        <StatsCard
          title="Gross Revenue"
          value={`₦${telemetry.grossRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="amber"
          description="Completed sales"
        />
      </div>

      {/* Quick Action Navigation */}
      <div>
        <h3 className="text-base font-semibold text-slate-900 mb-3">Merchant Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            href="/vendor/products/new"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition text-center group"
          >
            <div className="p-2.5 rounded-lg bg-emerald-50 text-shop-dark-green group-hover:scale-105 transition">
              <PlusCircle className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-semibold text-slate-800">Add Product</span>
          </Link>

          <Link
            href="/vendor/products"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition text-center group"
          >
            <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700 group-hover:scale-105 transition">
              <Package className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-semibold text-slate-800">Manage Products</span>
          </Link>

          <Link
            href="/vendor/inventory"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition text-center group"
          >
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700 group-hover:scale-105 transition">
              <Warehouse className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-semibold text-slate-800">Inventory</span>
          </Link>

          <Link
            href="/vendor/orders"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition text-center group"
          >
            <div className="p-2.5 rounded-lg bg-purple-50 text-purple-700 group-hover:scale-105 transition">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-semibold text-slate-800">View Orders</span>
          </Link>

          <Link
            href="/vendor/profile"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition text-center group"
          >
            <div className="p-2.5 rounded-lg bg-teal-50 text-teal-700 group-hover:scale-105 transition">
              <Store className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-semibold text-slate-800">Store Profile</span>
          </Link>
        </div>
      </div>

      {/* Recent Store Orders & Low Stock Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Store Orders */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Recent Customer Orders</h3>
              <p className="text-xs text-slate-500">Orders placed for your store products</p>
            </div>
            <Link
              href="/vendor/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-shop-dark-green hover:underline"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No orders received for your store yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recentOrders.map((ord: any) => (
                <div key={ord._id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-semibold text-slate-900">
                      {ord.orderNumber ? `#${ord.orderNumber.slice(-8)}` : "Order"}
                    </span>
                    <p className="text-xs text-slate-500">{ord.customerName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-900">
                      ₦{ord.vendorTotal ? ord.vendorTotal.toLocaleString() : "0"}
                    </span>
                    <StatusBadge status={ord.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Items */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Low Stock Monitor</h3>
              <p className="text-xs text-slate-500">Items requiring restocking soon</p>
            </div>
            <Link
              href="/vendor/inventory"
              className="inline-flex items-center gap-1 text-xs font-semibold text-shop-dark-green hover:underline"
            >
              Inventory <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {stats.lowStockItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              All inventory levels are healthy (greater than 5 units).
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.lowStockItems.map((item: any) => {
                const img =
                  item.image && item.image[0]
                    ? urlFor(item.image[0]).width(48).height(48).url()
                    : null;
                return (
                  <div key={item._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-9 w-9 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
                        {img ? (
                          <Image src={img} alt={item.title} fill className="object-cover" />
                        ) : (
                          <Package className="h-4 w-4 m-auto text-slate-400" />
                        )}
                      </div>
                      <span className="font-medium text-slate-900 text-sm truncate max-w-[200px]">
                        {item.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          item.stock === 0
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.stock === 0 ? "Out of Stock" : `${item.stock} left`}
                      </span>
                      <Link
                        href={`/vendor/products/${item._id}/edit`}
                        className="text-xs font-semibold text-shop-dark-green hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardPage;
