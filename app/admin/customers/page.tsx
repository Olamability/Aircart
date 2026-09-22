import React from "react";
import Link from "next/link";
import { Users, ShoppingBag, Mail, Calendar, ArrowRight } from "lucide-react";
import { getAdminCustomers } from "@/sanity/queries/adminQueries";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FilterBar from "@/components/dashboard/FilterBar";
import EmptyState from "@/components/dashboard/EmptyState";

interface AdminCustomersPageProps {
  searchParams: Promise<{ query?: string }>;
}

const AdminCustomersPage = async ({ searchParams }: AdminCustomersPageProps) => {
  const sp = await searchParams;
  const customers = await getAdminCustomers({ query: sp.query });

  return (
    <div className="space-y-6 pb-12">
      <DashboardHeader
        title="Customer Directory"
        description="Buyer accounts, purchasing volumes, and transaction histories across the marketplace."
      />

      <FilterBar searchPlaceholder="Search customers by name or email..." />

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers found"
          description="Customer records will appear here as orders are placed across the platform."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Orders</th>
                  <th className="px-4 py-3.5">Lifetime Spend</th>
                  <th className="px-4 py-3.5">Last Active</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/75 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 font-semibold text-shop-dark-green text-sm">
                          {cust.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">{cust.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ID: {cust.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-600 font-medium">
                      {cust.email || "No email on record"}
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">
                        {cust.orderCount} order{cust.orderCount === 1 ? "" : "s"}
                      </span>
                    </td>

                    <td className="px-4 py-4 font-semibold text-slate-900">
                      ₦{cust.totalSpend.toLocaleString()}
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-500">
                      {cust.lastOrderDate
                        ? new Date(cust.lastOrderDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/orders?query=${encodeURIComponent(cust.email || cust.name)}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-shop-dark-green hover:underline"
                      >
                        Orders <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {customers.map((cust) => (
              <div key={cust.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 font-semibold text-shop-dark-green text-xs">
                      {cust.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{cust.name}</h4>
                      <p className="text-xs text-slate-500">{cust.email}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">
                    ₦{cust.totalSpend.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
                  <span>{cust.orderCount} orders</span>
                  <Link
                    href={`/admin/orders?query=${encodeURIComponent(cust.email || cust.name)}`}
                    className="font-medium text-shop-dark-green hover:underline"
                  >
                    View Orders →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomersPage;
