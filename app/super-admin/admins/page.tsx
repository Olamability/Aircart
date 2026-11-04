import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserCheck, Shield, Users, ArrowRight, UserPlus } from "lucide-react";
import { getUserRole, getSuperAdminUsers } from "@/lib/roles";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";

export const dynamic = "force-dynamic";

const scopeDescriptions: Record<string, string> = {
  super_admin: "Full System Authority & Governance",
  admin: "Catalog, Approvals & Order Fulfillment",
  product_manager: "Product Catalog, Taxonomy & Categories",
};

export default async function SuperAdminAdminsPage() {
  const role = await getUserRole();
  if (role !== "super_admin") {
    redirect("/");
  }

  await requirePermission(permissions.admin_manage);

  const { users } = await getSuperAdminUsers();
  // Filter for privileged administrative & managerial accounts
  const staffUsers = users.filter((u) =>
    ["super_admin", "admin", "product_manager"].includes(u.role)
  );

  return (
    <div className="space-y-8 pb-12">
      <DashboardHeader
        title="Admin Staff Management"
        description="Audit platform administrator accounts, security credentials, and supervisory permissions."
      >
        <div className="flex gap-2">
          <Link
            href="/super-admin/users"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <Users className="h-3.5 w-3.5" />
            All Platform Users
          </Link>
          <Link
            href="/super-admin/roles"
            className="inline-flex items-center gap-1.5 rounded-xl bg-shop-dark-green px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-shop-light-green transition"
          >
            <Shield className="h-3.5 w-3.5" />
            Role Hierarchy
          </Link>
        </div>
      </DashboardHeader>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Staff Name & Email</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Scope & Authority</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Last Session</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffUsers.map((staff) => {
                const name =
                  [staff.firstName, staff.lastName].filter(Boolean).join(" ") ||
                  staff.username ||
                  "Staff Member";

                const lastLogin = staff.lastSignInAt
                  ? new Date(staff.lastSignInAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Never";

                return (
                  <tr key={staff.id} className="hover:bg-slate-50/75 transition">
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-900 block">{name}</span>
                      <span className="text-xs text-slate-500">{staff.email}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {staff.id.slice(0, 14)}...
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={staff.role} />
                    </td>

                    <td className="px-4 py-4 text-xs font-medium text-slate-700">
                      {scopeDescriptions[staff.role] || "Administrative scope"}
                    </td>

                    <td className="px-4 py-4">
                      {staff.banned ? (
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
                          Suspended
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-500 font-mono">
                      {lastLogin}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/super-admin/users/${staff.id}`}
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
    </div>
  );
}
