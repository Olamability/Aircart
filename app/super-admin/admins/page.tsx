import React from "react";
import { UserCheck, Shield, Key, UserPlus } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

const SuperAdminAdminsPage = () => {
  const staffRoster = [
    {
      name: "Platform Super Admin",
      email: "superadmin@airmart.ng",
      role: "super_admin",
      status: "active",
      lastLogin: "Just now",
      accessLevel: "Full System Authority",
    },
    {
      name: "Marketplace Operations Admin",
      email: "admin@airmart.ng",
      role: "admin",
      status: "active",
      lastLogin: "2 hours ago",
      accessLevel: "Catalog, Approvals & Orders",
    },
    {
      name: "Lead Product Manager",
      email: "products@airmart.ng",
      role: "product_manager",
      status: "active",
      lastLogin: "1 day ago",
      accessLevel: "Product Catalog & Categories",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <DashboardHeader
        title="Admin Staff Management"
        description="Audit platform administrator accounts, security credentials, and supervisory permissions."
      >
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-shop-dark-green px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-shop-light-green transition"
        >
          <UserPlus className="h-4 w-4" />
          Invite Staff
        </button>
      </DashboardHeader>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Staff Name</th>
              <th className="px-4 py-3.5">Role</th>
              <th className="px-4 py-3.5">Scope & Access Level</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Last Session</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staffRoster.map((staff, idx) => (
              <tr key={idx} className="hover:bg-slate-50/75 transition">
                <td className="px-5 py-4">
                  <span className="font-semibold text-slate-900 block">{staff.name}</span>
                  <span className="text-xs text-slate-500">{staff.email}</span>
                </td>

                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
                    <Shield className="h-3 w-3" />
                    {staff.role}
                  </span>
                </td>

                <td className="px-4 py-4 text-xs font-medium text-slate-700">
                  {staff.accessLevel}
                </td>

                <td className="px-4 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {staff.status}
                  </span>
                </td>

                <td className="px-5 py-4 text-right text-xs text-slate-500">
                  {staff.lastLogin}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminAdminsPage;
