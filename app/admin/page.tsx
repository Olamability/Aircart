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
  Activity,
  LayoutDashboard,
} from "lucide-react";
import { redirect } from "next/navigation";

import { getAdminDashboardStats } from "@/sanity/queries/adminQueries";
import { getUserRole } from "@/lib/roles";

import StatsCard from "@/components/dashboard/StatsCard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";

const AdminDashboardPage = async () => {
  // Preserve product manager access restriction.
  const role = await getUserRole();

  if (role === "product_manager") {
    redirect("/admin/products");
  }

  const stats = await getAdminDashboardStats();

  const quickActions = [
    {
      title: "Add Product",
      description: "Create a listing",
      href: "/admin/products/new",
      icon: PlusCircle,
      iconStyle: "bg-emerald-50 text-shop-dark-green",
    },
    {
      title: "Manage Vendors",
      description: "Merchant accounts",
      href: "/admin/vendors",
      icon: Store,
      iconStyle: "bg-orange-50 text-shop-darkOrange",
    },
    {
      title: "Review Approvals",
      description: "Verify applications",
      href: "/admin/approvals",
      icon: ShieldCheck,
      iconStyle: "bg-amber-50 text-amber-700",
    },
    {
      title: "View Orders",
      description: "Manage transactions",
      href: "/admin/orders",
      icon: ShoppingBag,
      iconStyle: "bg-purple-50 text-purple-700",
    },
    {
      title: "Categories",
      description: "Organise products",
      href: "/admin/categories",
      icon: FolderTree,
      iconStyle: "bg-teal-50 text-teal-700",
    },
    {
      title: "Services",
      description: "Manage services",
      href: "/admin/services",
      icon: Sparkles,
      iconStyle: "bg-indigo-50 text-indigo-700",
    },
  ];

  return (
    <div className="space-y-7 pb-12 sm:space-y-8">
      {/* Dashboard header */}
      <DashboardHeader
        title="Admin Overview"
        description="Monitor platform operations, vendor activity, and marketplace performance from one place."
      >
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-shop-dark-green px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-shop-light-green hover:shadow-md hoverEffect sm:py-2.5"
          >
            <PlusCircle className="h-4 w-4" />
            Add Product
          </Link>

          <Link
            href="/admin/approvals"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-xs transition-all duration-200 hover:border-amber-200 hover:bg-amber-50/60 hoverEffect sm:py-2.5"
          >
            <Clock className="h-4 w-4 text-amber-600" />
            Review Approvals
            {stats.pendingApprovals > 0 && (
              <span className="ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                {stats.pendingApprovals}
              </span>
            )}
          </Link>
        </div>
      </DashboardHeader>

      {/* Dashboard identity strip */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-shop-dark-green to-[#0A5136] p-5 text-white shadow-sm sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full border-[28px] border-white/[0.04]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-white/[0.04] blur-2xl"
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-200">
                Spaazr Administration
              </p>
              <h2 className="mt-1 text-lg font-bold tracking-tight text-white sm:text-xl">
                Platform Command Centre
              </h2>
              <p className="mt-1 text-xs leading-5 text-emerald-50/75 sm:text-sm">
                Your overview of marketplace operations and activity.
              </p>
            </div>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
            </span>
            <span className="text-xs font-semibold text-emerald-50">
              Dashboard overview
            </span>
          </div>
        </div>
      </div>

      {/* Operational alerts */}
      {(stats.pendingApprovals > 0 || stats.lowStockCount > 0) && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Requires Attention
            </h3>
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
              {Number(stats.pendingApprovals > 0) +
                Number(stats.lowStockCount > 0)}{" "}
              alerts
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {stats.pendingApprovals > 0 && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-white p-4 shadow-xs sm:p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Clock className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-amber-950">
                    {stats.pendingApprovals} Vendor Application
                    {stats.pendingApprovals === 1 ? "" : "s"} Pending
                  </h4>
                  <p className="mt-1 text-xs leading-5 text-amber-800/80">
                    New merchants are awaiting onboarding verification and
                    document approval.
                  </p>

                  <Link
                    href="/admin/approvals"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 transition-colors hover:text-amber-700"
                  >
                    Review applications
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {stats.lowStockCount > 0 && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/90 to-white p-4 shadow-xs sm:p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-rose-950">
                    {stats.lowStockCount} Product
                    {stats.lowStockCount === 1 ? "" : "s"} Running Low on Stock
                  </h4>
                  <p className="mt-1 text-xs leading-5 text-rose-800/80">
                    Inventory levels are at five units or below. Review these
                    products for possible restocking.
                  </p>

                  <Link
                    href="/admin/products?status=all"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-rose-900 transition-colors hover:text-rose-700"
                  >
                    View products
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* KPI metrics */}
      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Platform Performance
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Key marketplace figures at a glance.
            </p>
          </div>

          <span className="text-[11px] font-medium text-slate-400">
            Platform statistics
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
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
            description="Inventory ≤ 5"
          />
        </div>
      </section>

      {/* Quick actions */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Quick Actions
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Jump directly to frequently used management areas.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.title}
                href={action.href}
                className="group flex min-h-[130px] flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md hoverEffect sm:min-h-[145px] sm:p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${action.iconStyle}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-shop-dark-green" />
                </div>

                <div className="mt-4">
                  <p className="text-xs font-bold leading-5 text-slate-900 sm:text-sm">
                    {action.title}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-4 text-slate-500 sm:text-xs">
                    {action.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent activity */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Recent Activity
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            A snapshot of the latest orders and product additions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {/* Recent orders */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                  <ShoppingBag className="h-4 w-4" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Recent Platform Orders
                  </h4>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Latest activity across vendors
                  </p>
                </div>
              </div>

              <Link
                href="/admin/orders"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-shop-dark-green transition-colors hover:text-shop-light-green"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {stats.recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No orders yet
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  New marketplace orders will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {order.orderNumber
                          ? `#${order.orderNumber.slice(-8)}`
                          : "Order"}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {order.customerName}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                      <span className="text-sm font-bold tabular-nums text-slate-900">
                        ₦{order.totalPrice?.toLocaleString() ?? "0"}
                      </span>

                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent products */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-shop-dark-green">
                  <Package className="h-4 w-4" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Recent Products
                  </h4>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Latest additions to the marketplace
                  </p>
                </div>
              </div>

              <Link
                href="/admin/products"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-shop-dark-green transition-colors hover:text-shop-light-green"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {stats.recentProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                  <Package className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No products yet
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Newly added marketplace products will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {stats.recentProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {product.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        Vendor: {product.vendorName || "Direct"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <span className="text-sm font-bold tabular-nums text-slate-900">
                        ₦{product.price?.toLocaleString() ?? "0"}
                      </span>

                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        Qty: {product.stock}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;