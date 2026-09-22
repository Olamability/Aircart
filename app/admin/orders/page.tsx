import React from "react";
import Link from "next/link";
import { ShoppingBag, Eye, ArrowLeft, ArrowRight } from "lucide-react";
import { getAdminOrders } from "@/sanity/queries/adminQueries";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FilterBar from "@/components/dashboard/FilterBar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";

interface AdminOrdersPageProps {
  searchParams: Promise<{
    query?: string;
    status?: string;
    paymentStatus?: string;
    page?: string;
  }>;
}

const AdminOrdersPage = async ({ searchParams }: AdminOrdersPageProps) => {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) : 1;

  const { orders, total, totalPages } = await getAdminOrders({
    query: sp.query,
    status: sp.status,
    paymentStatus: sp.paymentStatus,
    page,
    limit: 15,
  });

  const filters = [
    {
      key: "status",
      label: "Fulfillment",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Processing", value: "processing" },
        { label: "Shipped", value: "shipped" },
        { label: "Delivered", value: "delivered" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
    {
      key: "paymentStatus",
      label: "Payment",
      options: [
        { label: "Paid", value: "paid" },
        { label: "Pending", value: "pending" },
        { label: "Failed", value: "failed" },
        { label: "Refunded", value: "refunded" },
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <DashboardHeader
        title="Orders Management"
        description="Monitor marketplace orders across all merchants, track shipments, and oversee payment states."
      />

      <FilterBar searchPlaceholder="Search by order #, customer, email..." filters={filters} />

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          description="There are currently no customer orders matching the specified filter criteria."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Vendors</th>
                  <th className="px-4 py-3.5">Total</th>
                  <th className="px-4 py-3.5">Payment</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order: any) => (
                  <tr key={order._id} className="hover:bg-slate-50/75 transition">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="font-medium text-slate-900 hover:text-shop-dark-green font-mono hover:underline"
                      >
                        {order.orderNumber ? `#${order.orderNumber.slice(-8)}` : order._id.slice(0, 8)}
                      </Link>
                      <span className="block text-[11px] text-slate-400 font-mono">
                        {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-medium text-slate-900 block">
                        {order.customerName || "Customer"}
                      </span>
                      <span className="text-xs text-slate-400 block truncate max-w-[180px]">
                        {order.customerEmail}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-600 max-w-[160px] truncate">
                      {order.vendors?.length ? order.vendors.join(", ") : "—"}
                    </td>

                    <td className="px-4 py-4 font-semibold text-slate-900">
                      ₦{order.totalPrice?.toLocaleString()}
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={order.paymentStatus || "pending"} />
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={order.status || "pending"} />
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {orders.map((order: any) => (
              <div key={order._id} className="p-4 space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-bold text-slate-900">
                      #{order.orderNumber?.slice(-8) || order._id.slice(0, 8)}
                    </span>
                    <p className="text-xs text-slate-600 mt-0.5">{order.customerName}</p>
                  </div>
                  <span className="font-bold text-slate-900">
                    ₦{order.totalPrice?.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={order.status || "pending"} />
                  <StatusBadge status={order.paymentStatus || "pending"} />
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
                  <span>
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}
                  </span>
                  <Link
                    href={`/admin/orders/${order._id}`}
                    className="font-medium text-shop-dark-green hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-sm text-slate-500">
              <span>
                Page {page} of {totalPages} ({total} total)
              </span>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/orders?page=${page - 1}${sp.query ? `&query=${sp.query}` : ""}${sp.status ? `&status=${sp.status}` : ""}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/orders?page=${page + 1}${sp.query ? `&query=${sp.query}` : ""}${sp.status ? `&status=${sp.status}` : ""}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Next <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
