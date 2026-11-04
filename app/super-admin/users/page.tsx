import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Search,
  Filter,
  ArrowRight,
  Clock,
  AlertTriangle,
  Flag,
  CheckCircle2,
} from "lucide-react";
import { getUserRole, getSuperAdminUsers } from "@/lib/roles";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FilterBar from "@/components/dashboard/FilterBar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import StatsCard from "@/components/dashboard/StatsCard";

export const dynamic = "force-dynamic";

interface SuperAdminUsersPageProps {
  searchParams: Promise<{
    query?: string;
    role?: string;
    status?: string;
    verification?: string;
  }>;
}

export default async function SuperAdminUsersPage({ searchParams }: SuperAdminUsersPageProps) {
  const role = await getUserRole();
  if (role !== "super_admin") {
    redirect("/");
  }

  await requirePermission(permissions.admin_manage);

  const sp = await searchParams;
  const { users, totalCount, filteredCount, isAvailable, error } = await getSuperAdminUsers({
    query: sp.query,
    role: sp.role,
    status: sp.status,
    verification: sp.verification,
  });

  const activeCount = users.filter((u) => !u.banned && !u.locked && !u.flagged).length;
  const restrictedCount = users.filter((u) => u.banned || u.locked).length;
  const flaggedCount = users.filter((u) => u.flagged).length;

  const filters = [
    {
      key: "role",
      label: "Authority Role",
      options: [
        { label: "Customer", value: "customer" },
        { label: "Vendor", value: "vendor" },
        { label: "Product Manager", value: "product_manager" },
        { label: "Admin", value: "admin" },
        { label: "Super Admin", value: "super_admin" },
      ],
    },
    {
      key: "status",
      label: "Account State",
      options: [
        { label: "Active & Permitted", value: "active" },
        { label: "Suspended / Banned", value: "suspended" },
        { label: "Locked", value: "locked" },
        { label: "Flagged for Review", value: "flagged" },
      ],
    },
    {
      key: "verification",
      label: "Verification",
      options: [
        { label: "Verified", value: "verified" },
        { label: "Pending", value: "pending" },
        { label: "Unverified", value: "unverified" },
      ],
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <DashboardHeader
        title="User & Account Governance"
        description="Global control over all marketplace identity records, role delegations, account restrictions, and verification status."
      >
        <Link
          href="/super-admin"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
        >
          Console Overview
        </Link>
      </DashboardHeader>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={totalCount}
          icon={Users}
          color="purple"
          description="Registered platform accounts"
        />
        <StatsCard
          title="Active Accounts"
          value={activeCount}
          icon={UserCheck}
          color="green"
          description="Normal permitted access"
        />
        <StatsCard
          title="Suspended / Restricted"
          value={restrictedCount}
          icon={UserX}
          color="rose"
          description="Banned or locked users"
        />
        <StatsCard
          title="Flagged Accounts"
          value={flaggedCount}
          icon={Flag}
          color="amber"
          description="Under review or reported"
        />
      </div>

      {/* Service Warning if unavailable */}
      {!isAvailable && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <p className="font-bold">Identity Service Notice</p>
          <p>{error || "Could not synchronize Clerk user records. Please check API credentials."}</p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <FilterBar
        searchPlaceholder="Search users by name, email, username or Clerk ID..."
        filters={filters}
      />

      {/* User Records Table */}
      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users match criteria"
          description="Try adjusting your search query, role filter, or account state filters."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">User Identity</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Account State</th>
                  <th className="px-4 py-3.5">Verification</th>
                  <th className="px-4 py-3.5">Joined</th>
                  <th className="px-4 py-3.5">Last Session</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ") || "User";
                  const initial = (u.firstName?.[0] || u.username?.[0] || u.email[0] || "U").toUpperCase();

                  const joinedDate = new Date(u.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  const lastSessionDate = u.lastSignInAt
                    ? new Date(u.lastSignInAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Never";

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-700 text-sm">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900 block truncate">
                              {fullName}
                            </span>
                            <span className="text-xs text-slate-500 block truncate">
                              {u.email}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {u.id.slice(0, 14)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={u.role} />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          {u.banned ? (
                            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                              Suspended
                            </span>
                          ) : u.locked ? (
                            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                              Locked
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          )}

                          {u.flagged && (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-900 flex items-center gap-1">
                              <Flag className="h-2.5 w-2.5" /> Flagged
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {u.verificationStatus === "verified" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                          </span>
                        ) : u.verificationStatus === "pending" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                            <Clock className="h-3.5 w-3.5" /> Pending
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">
                            Unverified
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-600 font-mono">
                        {joinedDate}
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-500 font-mono">
                        {lastSessionDate}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/super-admin/users/${u.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-shop-dark-green hover:underline"
                        >
                          Manage <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

