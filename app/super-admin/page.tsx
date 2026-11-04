import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users,
  Store,
  ShoppingBag,
  Package,
  TrendingUp,
  Percent,
  Wallet,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Ban,
  RefreshCcw,
  ArrowRight,
  Activity,
  CreditCard,
  Webhook,
  Sliders,
  UserCheck,
  Radio,
  Boxes,
  HelpCircle,
} from "lucide-react";

import { getUserRole, getClerkUserMetrics } from "@/lib/roles";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import { getSuperAdminDashboardMetrics } from "@/sanity/queries/adminQueries";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import StatusBadge from "@/components/dashboard/StatusBadge";

export const dynamic = "force-dynamic";

const SuperAdminDashboardPage = async () => {
  // Authorisation: server-side verification of Super Admin role and platform metrics permission.
  const role = await getUserRole();
  if (role !== "super_admin") {
    redirect("/");
  }

  await requirePermission(permissions.platform_metrics);

  // Fetch live backend metrics concurrently from Clerk and Sanity
  const [sanityMetrics, userMetrics] = await Promise.all([
    getSuperAdminDashboardMetrics(),
    getClerkUserMetrics(),
  ]);

  const {
    vendorStats,
    productStats,
    orderStats,
    financials,
    paymentStats,
    disputeStats,
    recentOrders,
    recentVendors,
    recentProducts,
    recentTransactions,
    alerts,
    isAvailable: sanityAvailable,
    error: sanityError,
  } = sanityMetrics;

  const {
    totalUsers,
    activeUsers,
    restrictedUsers,
    customers,
    vendors: clerkVendors,
    administrators,
    productManagers,
    superAdmins,
    recentUsers,
    isAvailable: clerkAvailable,
    error: clerkError,
  } = userMetrics;

  // Build unified recent platform activities stream from persisted records
  type ActivityItem = {
    id: string;
    category: "order" | "vendor" | "product" | "payment" | "user";
    title: string;
    actor: string;
    detail: string;
    status?: string;
    timestamp: number;
    href: string;
  };

  const activities: ActivityItem[] = [];

  for (const o of recentOrders) {
    activities.push({
      id: `order-${o._id}`,
      category: "order",
      title: `Order #${o.orderNumber ? o.orderNumber.slice(-8) : o._id.slice(0, 8)}`,
      actor: o.customerName || "Customer",
      detail: `₦${o.totalPrice?.toLocaleString() ?? "0"} • ${o.status}`,
      status: o.status,
      timestamp: new Date(o.createdAt).getTime(),
      href: `/admin/orders/${o._id}`,
    });
  }

  for (const v of recentVendors) {
    activities.push({
      id: `vendor-${v._id}`,
      category: "vendor",
      title: v.businessName,
      actor: v.email,
      detail: `Merchant account • ${v.status}`,
      status: v.status,
      timestamp: new Date(v.createdAt).getTime(),
      href: `/admin/vendors/${v._id}`,
    });
  }

  for (const p of recentProducts) {
    activities.push({
      id: `prod-${p._id}`,
      category: "product",
      title: p.title,
      actor: p.vendorName || "Direct / Spaazr",
      detail: `₦${p.price?.toLocaleString() ?? "0"} • Stock: ${p.stock}`,
      status: p.stock > 0 ? "available" : "out_of_stock",
      timestamp: new Date(p.createdAt).getTime(),
      href: `/admin/products/${p._id}/edit`,
    });
  }

  for (const t of recentTransactions) {
    const ref = t.paymentReference || t.stripeCheckoutSessionId || t._id;
    activities.push({
      id: `tx-${t._id}`,
      category: "payment",
      title: `Tx ${ref.slice(0, 14)}...`,
      actor: t.customerName,
      detail: `₦${t.totalPrice?.toLocaleString() ?? "0"} • ${t.paymentStatus}`,
      status: t.paymentStatus,
      timestamp: new Date(t.createdAt).getTime(),
      href: `/admin/transactions?status=${encodeURIComponent(t.paymentStatus)}`,
    });
  }

  for (const u of recentUsers) {
    activities.push({
      id: `user-${u.id}`,
      category: "user",
      title: u.name,
      actor: u.email,
      detail: `Role: ${u.role}${u.banned ? " (Restricted)" : ""}`,
      status: u.role,
      timestamp: u.createdAt,
      href: u.role === "super_admin" || u.role === "admin" ? "/super-admin/admins" : "/admin/customers",
    });
  }

  activities.sort((a, b) => b.timestamp - a.timestamp);

  // Total count of operational alerts requiring attention
  const totalAlertsCount =
    (alerts.suspendedVendors.length > 0 ? 1 : 0) +
    (productStats.lowStock > 0 ? 1 : 0) +
    (alerts.failedOrders.length > 0 ? 1 : 0);

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header */}
      <DashboardHeader
        title="Super Admin Platform Console"
        description="Global marketplace operational telemetry, financial settlements, catalog inventory, and multi-tier governance."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/super-admin/webhooks"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <Webhook className="h-3.5 w-3.5 text-teal-600" />
            Webhooks
          </Link>
          <Link
            href="/super-admin/fees"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <Percent className="h-3.5 w-3.5 text-amber-600" />
            Take Rate (5.0%)
          </Link>
          <Link
            href="/super-admin"
            className="inline-flex items-center gap-1.5 rounded-xl bg-shop-dark-green px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-shop-light-green transition"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Refresh Telemetry
          </Link>
        </div>
      </DashboardHeader>

      {/* 2. Platform Command Center Identity Strip */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-900/10 bg-gradient-to-br from-[#1E1B4B] via-[#2E1065] to-purple-950 p-5 text-white shadow-sm sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full border-[28px] border-white/[0.04]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-purple-500/[0.06] blur-2xl"
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-xs">
              <ShieldAlert className="h-6 w-6 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-200">
                  Spaazr Central Oversight
                </p>
                <span className="rounded-full bg-purple-400/20 px-2 py-0.5 text-[10px] font-bold text-purple-100 border border-purple-300/30">
                  Root Authority
                </span>
              </div>
              <h2 className="mt-1 text-lg font-bold tracking-tight text-white sm:text-xl">
                Global Marketplace Command Centre
              </h2>
              <p className="mt-0.5 text-xs text-purple-200/80 sm:text-sm">
                Continuous operational monitoring across Clerk identity, Sanity CMS catalog, and Stripe gateways.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 backdrop-blur-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-semibold text-emerald-100">
                Backend Live
              </span>
            </div>
            <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-purple-200">
              Take Rate: <span className="font-bold text-white">5.0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backend Integration Warnings (if partial query failure occurs) */}
      {(!sanityAvailable || !clerkAvailable) && (
        <div className="space-y-2">
          {!sanityAvailable && (
            <div className="flex items-center gap-3 rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-800">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
              <div>
                <p className="font-bold">Sanity Content Query Warning</p>
                <p className="text-rose-700">{sanityError || "Sanity live data temporarily unavailable."}</p>
              </div>
            </div>
          )}
          {!clerkAvailable && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-800">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-bold">Clerk User Identity Warning</p>
                <p className="text-amber-700">{clerkError || "Clerk identity records temporarily unavailable."}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Section E: Sales, Revenue & Financial Position */}
      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Financial Position & Sales Volume
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Authoritative transaction totals and platform fee take from persisted paid and fulfilled orders.
            </p>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Currency: NGN (₦)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link href="/admin/orders" className="block transition group">
            <StatsCard
              title="Gross Merchandise Value"
              value={`₦${financials.gmv.toLocaleString()}`}
              icon={TrendingUp}
              color="green"
              description="Completed & paid orders"
            />
          </Link>

          <Link href="/admin/transactions?status=paid" className="block transition group">
            <StatsCard
              title="Collected Revenue"
              value={`₦${financials.collectedRevenue.toLocaleString()}`}
              icon={CreditCard}
              color="blue"
              description="Confirmed gateway capture"
            />
          </Link>

          <Link href="/super-admin/fees" className="block transition group">
            <StatsCard
              title="Platform Commission"
              value={`₦${financials.platformCommission.toLocaleString()}`}
              icon={Percent}
              color="purple"
              description="5.0% standard take rate"
            />
          </Link>

          <Link href="/super-admin/fees" className="block transition group">
            <StatsCard
              title="Net Platform Revenue"
              value={`₦${financials.netPlatformRevenue.toLocaleString()}`}
              icon={ShieldCheck}
              color="green"
              description="Retained platform fees"
            />
          </Link>

          <Link href="/admin/vendors" className="block transition group">
            <StatsCard
              title="Vendor Net Earnings"
              value={`₦${financials.vendorEarnings.toLocaleString()}`}
              icon={Store}
              color="amber"
              description="Payable merchant settlements"
            />
          </Link>
        </div>
      </section>

      {/* 4. Operational Attention & Alerts (Section 3.H & 3.J) */}
      {(totalAlertsCount > 0 || alerts.criticalLowStock.length > 0) && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Operational Attention Required
            </h3>
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
              {productStats.lowStock + alerts.suspendedVendors.length + alerts.failedOrders.length} item{productStats.lowStock + alerts.suspendedVendors.length + alerts.failedOrders.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Low inventory alert */}
            <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/90 to-white p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-rose-950">
                    {productStats.lowStock} Low Stock Product{productStats.lowStock === 1 ? "" : "s"}
                  </h4>
                  <p className="mt-1 text-xs text-rose-800/80 leading-relaxed">
                    Inventory depleted to 5 units or below. Immediate merchant restock recommended.
                  </p>
                  <Link
                    href="/admin/products"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-rose-900 hover:text-rose-700 transition"
                  >
                    View low stock items <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Merchant compliance alert */}
            <div className={`rounded-2xl border p-5 shadow-xs ${
              alerts.suspendedVendors.length > 0
                ? "border-amber-200 bg-gradient-to-br from-amber-50/90 to-white"
                : "border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white"
            }`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  alerts.suspendedVendors.length > 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                }`}>
                  {alerts.suspendedVendors.length > 0 ? <Ban className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    {vendorStats.suspended} Suspended Accounts
                  </h4>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {alerts.suspendedVendors.length > 0
                      ? "Merchant storefronts currently restricted due to policy or verification audit."
                      : "Zero vendor accounts suspended. All onboarded merchants in good standing."}
                  </p>
                  <Link
                    href="/admin/compliance"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-shop-dark-green transition"
                  >
                    Compliance center <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Gateway & Webhook connectivity */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Radio className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    Gateway & Infrastructure
                  </h4>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    Stripe webhooks operational. Paystack direct gateway pending production secret connection.
                  </p>
                  <Link
                    href="/super-admin/webhooks"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-teal-800 hover:text-teal-600 transition"
                  >
                    Inspect webhooks <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Section A & B: User Identity & Vendor Lifecycle Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Ecosystem (Section 3.A) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">User Identity & Roles</h3>
            </div>
            <Link
              href="/super-admin/users"
              className="text-xs font-semibold text-shop-dark-green hover:underline flex items-center gap-1"
            >
              User Management <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link href="/super-admin/users" className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 hover:border-slate-300 transition">
              <p className="text-[11px] font-medium text-slate-500">Registered Users</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{totalUsers}</p>
              <span className="mt-0.5 inline-block text-[10px] text-emerald-600 font-medium">
                {activeUsers} active
              </span>
            </Link>

            <Link href="/admin/customers" className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 hover:border-slate-300 transition">
              <p className="text-[11px] font-medium text-slate-500">Customers</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{customers}</p>
              <span className="mt-0.5 inline-block text-[10px] text-slate-400">Buyers</span>
            </Link>

            <Link href="/admin/vendors" className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 hover:border-slate-300 transition">
              <p className="text-[11px] font-medium text-slate-500">Vendors (Clerk)</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{clerkVendors}</p>
              <span className="mt-0.5 inline-block text-[10px] text-slate-400">{vendorStats.approved} in Sanity</span>
            </Link>

            <Link href="/super-admin/admins" className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 hover:border-slate-300 transition">
              <p className="text-[11px] font-medium text-slate-500">Administrators</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{administrators}</p>
              <span className="mt-0.5 inline-block text-[10px] text-slate-400">Staff roles</span>
            </Link>

            <Link href="/super-admin/roles" className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 hover:border-slate-300 transition">
              <p className="text-[11px] font-medium text-slate-500">Product Managers</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{productManagers}</p>
              <span className="mt-0.5 inline-block text-[10px] text-slate-400">Catalog staff</span>
            </Link>

            <Link href="/super-admin/roles" className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 hover:border-slate-300 transition">
              <p className="text-[11px] font-medium text-slate-500">Super Admins</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{superAdmins}</p>
              <span className="mt-0.5 inline-block text-[10px] text-purple-600 font-medium">Root tier</span>
            </Link>
          </div>

          {restrictedUsers > 0 && (
            <p className="text-xs text-rose-600 font-medium pt-1">
              Notice: {restrictedUsers} user account{restrictedUsers === 1 ? "" : "s"} locked or banned in Clerk.
            </p>
          )}
        </div>

        {/* Vendor Lifecycle Breakdown (Section 3.B) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Vendor Onboarding & Status</h3>
            </div>
            <Link
              href="/admin/vendors"
              className="text-xs font-semibold text-shop-dark-green hover:underline flex items-center gap-1"
            >
              All Vendors <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/admin/vendors?status=approved"
              className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 hover:border-emerald-300 transition"
            >
              <p className="text-[11px] font-medium text-emerald-800">Approved</p>
              <p className="mt-1 text-xl font-bold text-emerald-950">{vendorStats.approved}</p>
              <span className="mt-0.5 inline-block text-[10px] text-emerald-700">Live merchants</span>
            </Link>

            <Link
              href="/admin/approvals"
              className="rounded-xl border border-amber-100 bg-amber-50/40 p-3 hover:border-amber-300 transition"
            >
              <p className="text-[11px] font-medium text-amber-800">Pending Review</p>
              <p className="mt-1 text-xl font-bold text-amber-950">{vendorStats.pending}</p>
              <span className="mt-0.5 inline-block text-[10px] text-amber-700">Awaiting audit</span>
            </Link>

            <Link
              href="/admin/compliance"
              className="rounded-xl border border-rose-100 bg-rose-50/40 p-3 hover:border-rose-300 transition"
            >
              <p className="text-[11px] font-medium text-rose-800">Suspended</p>
              <p className="mt-1 text-xl font-bold text-rose-950">{vendorStats.suspended}</p>
              <span className="mt-0.5 inline-block text-[10px] text-rose-700">Restricted</span>
            </Link>

            <Link
              href="/admin/vendors"
              className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 hover:border-slate-300 transition"
            >
              <p className="text-[11px] font-medium text-slate-600">Rejected</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{vendorStats.rejected}</p>
              <span className="mt-0.5 inline-block text-[10px] text-slate-500">Declined apps</span>
            </Link>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Total merchant documents: <strong className="text-slate-800">{vendorStats.total}</strong></span>
            <Link href="/admin/approvals" className="font-semibold text-amber-700 hover:underline">
              Open Approvals Queue →
            </Link>
          </div>
        </div>
      </div>

      {/* 6. Section C & D: Catalog Health & Order Fulfillment Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Catalog & Inventory Statistics (Section 3.C & 3.H) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Catalog & Inventory Health</h3>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-shop-dark-green hover:underline flex items-center gap-1"
            >
              Catalog <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link href="/admin/products" className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 hover:border-slate-300 transition">
              <p className="text-[11px] font-medium text-slate-500">Total Products</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{productStats.total}</p>
              <span className="mt-0.5 inline-block text-[10px] text-slate-500">Catalog scale</span>
            </Link>

            <Link href="/admin/products?status=available" className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3 hover:border-emerald-300 transition">
              <p className="text-[11px] font-medium text-emerald-800">Active Listings</p>
              <p className="mt-1 text-xl font-bold text-emerald-950">{productStats.active}</p>
              <span className="mt-0.5 inline-block text-[10px] text-emerald-700">In stock & live</span>
            </Link>

            <Link href="/admin/products" className="rounded-xl border border-rose-100 bg-rose-50/30 p-3 hover:border-rose-300 transition">
              <p className="text-[11px] font-medium text-rose-800">Low Stock (≤5)</p>
              <p className="mt-1 text-xl font-bold text-rose-950">{productStats.lowStock}</p>
              <span className="mt-0.5 inline-block text-[10px] text-rose-700">Near depletion</span>
            </Link>

            <Link href="/admin/products" className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 hover:border-slate-300 transition">
              <p className="text-[11px] font-medium text-slate-500">Out of Stock</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{productStats.outOfStock}</p>
              <span className="mt-0.5 inline-block text-[10px] text-slate-500">Stock = 0</span>
            </Link>

            <Link href="/admin/products" className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 hover:border-slate-300 transition">
              <p className="text-[11px] font-medium text-slate-500">Vendor Owned</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{productStats.vendorOwned}</p>
              <span className="mt-0.5 inline-block text-[10px] text-slate-500">Merchant items</span>
            </Link>

            <Link href="/admin/products" className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 hover:border-slate-300 transition">
              <p className="text-[11px] font-medium text-slate-500">Platform Direct</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{productStats.platformOwned}</p>
              <span className="mt-0.5 inline-block text-[10px] text-slate-500">Spaazr direct</span>
            </Link>
          </div>
        </div>

        {/* Order Fulfillment Pipeline (Section 3.D) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Order Fulfillment Pipeline</h3>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-shop-dark-green hover:underline flex items-center gap-1"
            >
              All Orders <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link href="/admin/orders" className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 hover:border-slate-300 transition">
              <p className="text-[11px] font-medium text-slate-500">Total Orders</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{orderStats.total}</p>
              <span className="mt-0.5 inline-block text-[10px] text-slate-500">All-time volume</span>
            </Link>

            <Link href="/admin/orders?status=processing" className="rounded-xl border border-sky-100 bg-sky-50/30 p-3 hover:border-sky-300 transition">
              <p className="text-[11px] font-medium text-sky-800">Processing</p>
              <p className="mt-1 text-xl font-bold text-sky-950">{orderStats.processing}</p>
              <span className="mt-0.5 inline-block text-[10px] text-sky-700">Awaiting dispatch</span>
            </Link>

            <Link href="/admin/orders?status=pending" className="rounded-xl border border-amber-100 bg-amber-50/30 p-3 hover:border-amber-300 transition">
              <p className="text-[11px] font-medium text-amber-800">Pending</p>
              <p className="mt-1 text-xl font-bold text-amber-950">{orderStats.pending}</p>
              <span className="mt-0.5 inline-block text-[10px] text-amber-700">Unconfirmed</span>
            </Link>

            <Link href="/admin/orders?status=shipped" className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-3 hover:border-indigo-300 transition">
              <p className="text-[11px] font-medium text-indigo-800">Shipped / Transit</p>
              <p className="mt-1 text-xl font-bold text-indigo-950">{orderStats.shipped}</p>
              <span className="mt-0.5 inline-block text-[10px] text-indigo-700">In delivery</span>
            </Link>

            <Link href="/admin/orders?status=delivered" className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3 hover:border-emerald-300 transition">
              <p className="text-[11px] font-medium text-emerald-800">Delivered</p>
              <p className="mt-1 text-xl font-bold text-emerald-950">{orderStats.delivered}</p>
              <span className="mt-0.5 inline-block text-[10px] text-emerald-700">Fulfilled</span>
            </Link>

            <Link href="/admin/orders?status=cancelled" className="rounded-xl border border-rose-100 bg-rose-50/30 p-3 hover:border-rose-300 transition">
              <p className="text-[11px] font-medium text-rose-800">Cancelled</p>
              <p className="mt-1 text-xl font-bold text-rose-950">{orderStats.cancelled}</p>
              <span className="mt-0.5 inline-block text-[10px] text-rose-700">Voided</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 7. Section F & G: Payments, Refunds & Disputes Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment & Refund Statistics (Section 3.F) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Payment Gateways & Settlements</h3>
            </div>
            <Link
              href="/admin/transactions"
              className="text-xs font-semibold text-shop-dark-green hover:underline flex items-center gap-1"
            >
              Transactions <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/admin/transactions?status=paid"
              className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 hover:border-emerald-300 transition"
            >
              <p className="text-[11px] font-medium text-emerald-800">Paid / Succeeded</p>
              <p className="mt-1 text-xl font-bold text-emerald-950">{paymentStats.paid}</p>
              <span className="mt-0.5 inline-block text-[10px] text-emerald-700">Settled</span>
            </Link>

            <Link
              href="/admin/transactions?status=pending"
              className="rounded-xl border border-amber-100 bg-amber-50/40 p-3 hover:border-amber-300 transition"
            >
              <p className="text-[11px] font-medium text-amber-800">Pending</p>
              <p className="mt-1 text-xl font-bold text-amber-950">{paymentStats.pending}</p>
              <span className="mt-0.5 inline-block text-[10px] text-amber-700">Awaiting auth</span>
            </Link>

            <Link
              href="/admin/transactions?status=failed"
              className="rounded-xl border border-rose-100 bg-rose-50/40 p-3 hover:border-rose-300 transition"
            >
              <p className="text-[11px] font-medium text-rose-800">Failed</p>
              <p className="mt-1 text-xl font-bold text-rose-950">{paymentStats.failed}</p>
              <span className="mt-0.5 inline-block text-[10px] text-rose-700">Declined</span>
            </Link>

            <Link
              href="/admin/transactions?status=refunded"
              className="rounded-xl border border-orange-100 bg-orange-50/40 p-3 hover:border-orange-300 transition"
            >
              <p className="text-[11px] font-medium text-orange-800">Refunded</p>
              <p className="mt-1 text-xl font-bold text-orange-950">{paymentStats.refunded}</p>
              <span className="mt-0.5 inline-block text-[10px] text-orange-700">
                ₦{paymentStats.refundedAmount.toLocaleString()}
              </span>
            </Link>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Primary Gateway: <strong className="text-slate-800">Stripe Checkout</strong></span>
            <span className="text-slate-400">Paystack: Pending connection</span>
          </div>
        </div>

        {/* Disputes & Claims Center (Section 3.G) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Disputes & Complaints Center</h3>
            </div>
            <Link
              href="/admin/disputes"
              className="text-xs font-semibold text-shop-dark-green hover:underline flex items-center gap-1"
            >
              Arbitration Hub <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/disputes"
              className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 hover:border-slate-300 transition"
            >
              <p className="text-xs font-medium text-slate-500">Open Arbitration Claims</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{disputeStats.openDisputes}</p>
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> No active disputes
              </span>
            </Link>

            <Link
              href="/admin/disputes"
              className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 hover:border-slate-300 transition"
            >
              <p className="text-xs font-medium text-slate-500">Unresolved Buyer Complaints</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{disputeStats.unresolvedComplaints}</p>
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-400">
                Clean customer queue
              </span>
            </Link>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-slate-400 shrink-0" />
              <span>Dedicated dispute document schema awaiting separate implementation phase.</span>
            </div>
            <Link href="/admin/disputes" className="font-semibold text-shop-dark-green shrink-0 hover:underline">
              Inspect Hub →
            </Link>
          </div>
        </div>
      </div>

      {/* 8. Section I: Live Recent Platform Activity Feed */}
      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-shop-dark-green" />
              <h3 className="text-base font-bold text-slate-900">
                Live Platform Operational Activity
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Chronological log of verified marketplace events: orders, merchant registrations, catalog additions, and account signups.
            </p>
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            {activities.length} recent platform events
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          {activities.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No recent platform activity recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activities.slice(0, 8).map((act) => {
                const dateStr = new Date(act.timestamp).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const categoryColors: Record<ActivityItem["category"], string> = {
                  order: "bg-purple-50 text-purple-700 border-purple-200",
                  vendor: "bg-amber-50 text-amber-700 border-amber-200",
                  product: "bg-emerald-50 text-shop-dark-green border-emerald-200",
                  payment: "bg-sky-50 text-sky-700 border-sky-200",
                  user: "bg-indigo-50 text-indigo-700 border-indigo-200",
                };

                return (
                  <div
                    key={act.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50/75 transition"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={`inline-flex shrink-0 items-center rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                          categoryColors[act.category]
                        }`}
                      >
                        {act.category}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {act.title}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {act.actor} • <span className="text-slate-600 font-medium">{act.detail}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span className="text-xs font-mono text-slate-400">
                        {dateStr}
                      </span>
                      <Link
                        href={act.href}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-emerald-300 hover:text-shop-dark-green transition"
                      >
                        Details <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 9. Super Admin Governance & Control Modules (Preserving existing links) */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900">Platform Governance Modules</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Administrative consoles for marketplace fees, credential delegation, webhook dispatch, and platform policies.
          </p>
        </div>

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
              Analyze macro marketplace trends, category scale distribution, and GMV expansion.
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
              Configure tier-based merchant fee schedules, 5% take rate, and payout thresholds.
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
      </section>
    </div>
  );
};

export default SuperAdminDashboardPage;
