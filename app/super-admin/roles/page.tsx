import React from "react";
import { ShieldAlert, ArrowDown, Check, Key } from "lucide-react";
import { rolePermissions } from "@/lib/permissions";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

const SuperAdminRolesPage = () => {
  const rolesHierarchy = [
    {
      role: "Super Admin",
      key: "super_admin",
      level: 5,
      desc: "Root platform governance, fee policies, staff management, webhooks, and security flags.",
      color: "border-purple-300 bg-purple-50/50",
      badgeColor: "bg-purple-100 text-purple-800",
      permissionsCount: Object.values(rolePermissions.super_admin).length,
    },
    {
      role: "Admin",
      key: "admin",
      level: 4,
      desc: "Merchant onboarding approval, dispute arbitration, orders audit, and full catalog control.",
      color: "border-emerald-300 bg-emerald-50/50",
      badgeColor: "bg-emerald-100 text-emerald-800",
      permissionsCount: rolePermissions.admin.length,
    },
    {
      role: "Product Manager",
      key: "product_manager",
      level: 3,
      desc: "Catalog taxonomy, category management, product curation, and inventory checks.",
      color: "border-sky-300 bg-sky-50/50",
      badgeColor: "bg-sky-100 text-sky-800",
      permissionsCount: rolePermissions.product_manager.length,
    },
    {
      role: "Vendor",
      key: "vendor",
      level: 2,
      desc: "Storefront branding, own inventory updates, order fulfillment, shipping dispatch, and sales ledger.",
      color: "border-amber-300 bg-amber-50/50",
      badgeColor: "bg-amber-100 text-amber-800",
      permissionsCount: rolePermissions.vendor.length,
    },
    {
      role: "Customer",
      key: "customer",
      level: 1,
      desc: "Shopping catalog, cart management, checkout payment, order history, and account profile.",
      color: "border-slate-200 bg-slate-50/50",
      badgeColor: "bg-slate-100 text-slate-800",
      permissionsCount: rolePermissions.customer.length,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <DashboardHeader
        title="Role Hierarchy & Permission Delegation"
        description="Enforced five-tier authority chain strictly validated by server-side guards."
      />

      {/* Authority Chain Diagram */}
      <div className="space-y-4 max-w-2xl">
        {rolesHierarchy.map((item, idx) => (
          <React.Fragment key={item.key}>
            <div className={`rounded-xl border p-5 shadow-xs ${item.color} space-y-2`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700 shadow-xs">
                    {item.level}
                  </span>
                  <h4 className="font-bold text-slate-900 text-base">{item.role}</h4>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${item.badgeColor}`}>
                  {item.permissionsCount} Active Permissions
                </span>
              </div>
              <p className="text-xs text-slate-600 pl-8.5">{item.desc}</p>
            </div>

            {idx < rolesHierarchy.length - 1 && (
              <div className="flex justify-center py-0.5">
                <ArrowDown className="h-4 w-4 text-slate-400" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminRolesPage;
