import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  ShoppingBag,
  Store,
  Shield,
  History,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  User,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { getUserRole, getSuperAdminUserDetail } from "@/lib/roles";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import SuperAdminUserControl from "@/components/dashboard/SuperAdminUserControl";

export const dynamic = "force-dynamic";

interface SuperAdminUserDetailPageProps {
  params: Promise<{ userId: string }>;
}

export default async function SuperAdminUserDetailPage({
  params,
}: SuperAdminUserDetailPageProps) {
  const role = await getUserRole();
  if (role !== "super_admin") {
    redirect("/");
  }

  await requirePermission(permissions.admin_manage);

  const { userId } = await params;
  const detail = await getSuperAdminUserDetail(userId);

  if (!detail || !detail.user) {
    notFound();
  }

  const { user, activeSessionsCount, orders, totalSpend, vendor } = detail;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "User";
  const initial = (user.firstName?.[0] || user.username?.[0] || user.email[0] || "U").toUpperCase();

  const joinedFormatted = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const lastActiveFormatted = user.lastSignInAt
    ? new Date(user.lastSignInAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never signed in";

  return (
    <div className="space-y-8 pb-16">
      {/* Top back navigation */}
      <div>
        <Link
          href="/super-admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-shop-dark-green transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to User Directory
        </Link>
      </div>

      {/* User Identity Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-2xl font-bold text-purple-700 shadow-xs">
              {initial}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{fullName}</h2>
                <StatusBadge status={user.role} />

                {user.banned ? (
                  <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
                    Suspended
                  </span>
                ) : user.locked ? (
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                    Locked
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                )}

                {user.verificationStatus === "verified" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 border border-teal-200">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {user.verificationStatus}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {user.email}
                </span>

                {user.username && (
                  <span className="flex items-center gap-1 font-mono">
                    <User className="h-3.5 w-3.5 text-slate-400" />@{user.username}
                  </span>
                )}

                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {user.phone}
                  </span>
                )}

                <span className="font-mono text-slate-400">ID: {user.id}</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-end gap-1 text-xs text-slate-500 shrink-0">
            <span>
              Registered: <strong className="text-slate-800">{joinedFormatted}</strong>
            </span>
            <span>
              Last Session: <strong className="text-slate-800">{lastActiveFormatted}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Account Telemetry Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Orders Placed</span>
            <ShoppingBag className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
          <p className="text-[11px] text-slate-400">Marketplace buyer orders</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Lifetime Spend</span>
            <CreditCard className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">₦{totalSpend.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400">Paid and completed</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Merchant Store</span>
            <Store className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-lg font-bold text-slate-900 truncate">
            {vendor ? vendor.businessName : "None"}
          </p>
          <p className="text-[11px] text-slate-400">
            {vendor ? `${vendor.productCount} products listed` : "Not a seller account"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Live Sessions</span>
            <Clock className="h-4 w-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{activeSessionsCount}</p>
          <p className="text-[11px] text-slate-400">Concurrent device tokens</p>
        </div>
      </div>

      {/* Associated Merchant Information (if vendor) */}
      {vendor && (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-amber-700" />
              <h3 className="text-sm font-bold text-amber-950">
                Connected Merchant Storefront: {vendor.businessName}
              </h3>
            </div>
            <Link
              href={`/admin/vendors/${vendor._id}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:underline"
            >
              Merchant Management <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-amber-900/80">
            Store Status: <strong className="capitalize">{vendor.status}</strong> • Catalog Scale:{" "}
            <strong>{vendor.productCount} active products</strong>
          </p>
        </div>
      )}

      {/* Interactive Super Admin Governance & Controls */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">Account Governance & Authority Controls</h3>
        <SuperAdminUserControl user={user} activeSessionsCount={activeSessionsCount} />
      </section>

      {/* Orders and Purchasing History */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Order & Purchasing History</h3>
            <p className="text-xs text-slate-500">
              Transaction records linked to this user's account ID and email.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {orders.length} total order{orders.length === 1 ? "" : "s"}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
            No order records associated with this account.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Order Number</th>
                    <th className="px-4 py-3.5">Amount</th>
                    <th className="px-4 py-3.5">Fulfillment</th>
                    <th className="px-4 py-3.5">Payment</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o: any) => (
                    <tr key={o._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-900">
                        #{o.orderNumber ? o.orderNumber.slice(-8) : o._id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-900">
                        ₦{o.totalPrice?.toLocaleString() ?? "0"}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={o.paymentStatus} />
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500 font-mono">
                        {new Date(o.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/orders/${o._id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-shop-dark-green hover:underline"
                        >
                          View Order <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Account Audit History */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-purple-600" />
          <h3 className="text-base font-bold text-slate-900">Administrative Audit Trail</h3>
        </div>

        {user.auditLog.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-400">
            No administrative modifications recorded on this account yet. Actions such as role adjustments, suspensions, and verification changes will log here.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="divide-y divide-slate-100">
              {user.auditLog.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-3.5 hover:bg-slate-50/60 transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {log.action}
                      </span>
                      <span className="text-xs text-slate-500">by {log.performedBy}</span>
                    </div>
                    {log.details && (
                      <p className="text-xs text-slate-700 pl-1">{log.details}</p>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

