import React from "react";
import Link from "next/link";
import {
  Package,
  Store,
  Clock,
  ShoppingBag,
  Users,
  AlertTriangle,
  PlusCircle,
  FolderTree,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getAdminDashboardStats } from "@/sanity/queries/adminQueries";
import StatsCard from "@/components/dashboard/StatsCard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";

const AdminDashboardPage = async () => {
  const role = await getUserRole();
  if (role === "product_manager") {
    redirect("/admin/products");
  }

  const stats = await getAdminDashboardStats();

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <DashboardHeader
        title="Admin Overview"
        description="Monitor platform operations, vendor activity, and marketplace catalog metrics."
      >
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-shop-dark-green px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-shop-light-green hoverEffect"
        >
          <PlusCircle className="h-4 w-4" />
          Add Product
        </Link>
        <Link
          href="/admin/approvals"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hoverEffect"
        >
          <Clock className="h-4 w-4 text-amber-600" />
          Review Approvals ({stats.pendingApprovals})
        </Link>
      </DashboardHeader>

      {/* Operational Alerts */}
      {(stats.pendingApprovals > 0 || stats.lowStockCount > 0) && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {stats.pendingApprovals > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
              <Clock className="mt-0.5 h-5 w-5 text-amber-600 shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-amber-900">
                  {stats.pendingApprovals} Vendor Application{stats.pendingApprovals > 1 ? "s" : ""} Pending
                </h4>
                <p className="mt-0.5 text-xs text-amber-700">
                  New merchants are awaiting onboarding verification and document approval.
                </p>
              </div>
              <Link
                href="/admin/approvals"
                className="text-xs font-semibold text-amber-900 underline hover:text-amber-700"
              >
                Review
              </Link>
            </div>
          )}

          {stats.lowStockCount > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-600 shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-rose-900">
                  {stats.lowStockCount} Product{stats.lowStockCount > 1 ? "s" : ""} Running Low On Stock
                </h4>
                <p className="mt-0.5 text-xs text-rose-700">
                  Inventory levels are under 5 units. Vendor notification or restocking needed.
                </p>
              </div>
              <Link
                href="/admin/products?status=all"
                className="text-xs font-semibold text-rose-900 underline hover:text-rose-700"
              >
                View Items
              </Link>
            </div>
          )}
        </div>
      )}

      {/* KPI Metrics Area */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          color="green"
          description="In catalog"
        />
        <StatsCard
          title="Active Vendors"
          value={stats.activeVendors}
          icon={Store}
          color="blue"
          description="Verified merchants"
        />
        <StatsCard
          title="Pending Queue"
          value={stats.pendingApprovals}
          icon={Clock}
          color="amber"
          description="Needs review"
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          color="purple"
          description="Platform volume"
        />
        <StatsCard
          title="Customers"
          value={stats.totalCustomers}
          icon={Users}
          color="blue"
          description="Unique buyers"
        />
        <StatsCard
          title="Low Stock"
          value={stats.lowStockCount}
          icon={AlertTriangle}
          color="rose"
          description="Inventory <= 5"
        />
      </div>

      {/* Quick Action Navigation */}
      <div>
        <h3 className="text-base font-semibold text-slate-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/admin/products/new"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition text-center group"
          >
            <div className="p-2.5 rounded-lg bg-emerald-50 text-shop-dark-green group-hover:scale-105 transition">
              <PlusCircle className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-semibold text-slate-800">Add Product</span>
          </Link>

          <Link
            href="/admin/vendors"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition text-center group"
          >
            <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700 group-hover:scale-105 transition">
              <Store className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-semibold text-slate-800">Manage Vendors</span>
          </Link>

          <Link
            href="/admin/approvals"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition text-center group"
          >
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700 group-hover:scale-105 transition">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-semibold text-slate-800">Review Approvals</span>
          </Link>

          <Link
            href="/admin/orders"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition text-center group"
          >
            <div className="p-2.5 rounded-lg bg-purple-50 text-purple-700 group-hover:scale-105 transition">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-semibold text-slate-800">View Orders</span>
          </Link>

          <Link
            href="/admin/categories"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition text-center group"
          >
            <div className="p-2.5 rounded-lg bg-teal-50 text-teal-700 group-hover:scale-105 transition">
              <FolderTree className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-semibold text-slate-800">Categories</span>
          </Link>

          <Link
            href="/admin/services"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition text-center group"
          >
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-700 group-hover:scale-105 transition">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-semibold text-slate-800">Services</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Recent Platform Orders</h3>
              <p className="text-xs text-slate-500">Live order activity across vendors</p>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-shop-dark-green hover:underline"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No orders placed yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recentOrders.map((order) => (
                <div key={order._id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-slate-900">
                      {order.orderNumber ? `#${order.orderNumber.slice(-8)}` : "Order"}
                    </span>
                    <p className="text-xs text-slate-500">{order.customerName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-900">
                      ₦{order.totalPrice?.toLocaleString()}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Products */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Recent Products</h3>
              <p className="text-xs text-slate-500">Latest additions to the marketplace</p>
            </div>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 text-xs font-semibold text-shop-dark-green hover:underline"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {stats.recentProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No products created yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recentProducts.map((product) => (
                <div key={product._id} className="py-3 flex items-center justify-between text-sm">
                  <div className="max-w-[200px] truncate">
                    <span className="font-medium text-slate-900 block truncate">
                      {product.title}
                    </span>
                    <p className="text-xs text-slate-500 truncate">
                      Vendor: {product.vendorName || "Direct"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-700">₦{product.price?.toLocaleString()}</span>
                    <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                      Qty: {product.stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
