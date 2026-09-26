import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, User, MapPin, CreditCard, FileText } from "lucide-react";
import { getAdminOrderDetail } from "@/sanity/queries/adminQueries";
import { urlFor } from "@/sanity/lib/image";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import OrderStatusSelect from "@/components/dashboard/OrderStatusSelect";
import { PermissionGuard } from "@/lib/permissionGuard";
import { permissions } from "@/lib/permissions";

interface AdminOrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

const AdminOrderDetailPage = async ({ params }: AdminOrderDetailPageProps) => {
  const { orderId } = await params;
  const order = await getAdminOrderDetail(orderId);

  if (!order) {
    notFound();
  }

  return (
    <PermissionGuard permission={permissions.orders_view}>
      <div className="space-y-8 pb-12">
      <div className="mb-2">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Orders
        </Link>
      </div>

      <DashboardHeader
        title={`Order #${order.orderNumber?.slice(-8) || order._id.slice(0, 8)}`}
        description={`Placed on ${
          order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }) : "—"
        }`}
        badge={<StatusBadge status={order.status || "pending"} />}
      >
        <OrderStatusSelect
          orderId={order._id}
          currentStatus={order.status || "pending"}
          currentPaymentStatus={order.paymentStatus || "pending"}
        />
      </DashboardHeader>

      {/* 3 Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Customer Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm border-b border-slate-100 pb-2">
            <User className="h-4 w-4 text-emerald-600" />
            Customer Details
          </div>
          <div>
            <span className="font-medium text-slate-900 text-sm">{order.customerName}</span>
            <p className="text-xs text-slate-500">{order.customerEmail}</p>
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              User ID: {order.clerkUserId || "Guest"}
            </p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm border-b border-slate-100 pb-2">
            <MapPin className="h-4 w-4 text-emerald-600" />
            Shipping Destination
          </div>
          {order.address ? (
            <div className="text-xs text-slate-600 space-y-0.5">
              <span className="font-medium text-slate-900 block">{order.address.name}</span>
              <p>{order.address.address}</p>
              <p>
                {order.address.city}, {order.address.state} {order.address.zip}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No physical shipping address provided.</p>
          )}
        </div>

        {/* Payment Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm border-b border-slate-100 pb-2">
            <CreditCard className="h-4 w-4 text-emerald-600" />
            Payment Status
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Status:</span>
              <StatusBadge status={order.paymentStatus || "pending"} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Reference:</span>
              <span className="font-mono text-slate-700 truncate max-w-[120px]">
                {order.paymentReference || order.stripeCheckoutSessionId?.slice(-10) || "—"}
              </span>
            </div>
            {order.invoice?.hosted_invoice_url && (
              <a
                href={order.invoice.hosted_invoice_url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-shop-dark-green hover:underline"
              >
                <FileText className="h-3.5 w-3.5" /> View Stripe Invoice
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Ordered Products Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Order Items ({order.products?.length || 0})
        </h3>

        <div className="divide-y divide-slate-100">
          {order.products?.map((item: any, idx: number) => {
            const prod = item.product;
            const imgUrl =
              prod?.image && prod.image[0]
                ? urlFor(prod.image[0]).width(80).height(80).url()
                : null;

            return (
              <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shrink-0">
                    {imgUrl ? (
                      <Image src={imgUrl} alt={prod?.title || "Item"} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <Package className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-slate-900 text-sm block">
                      {prod?.title || "Product item"}
                    </span>
                    <p className="text-xs text-slate-500">
                      Merchant: {prod?.vendor?.businessName || "Direct marketplace"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-semibold text-slate-900 text-sm block">
                    ₦{item.price?.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500">Qty: {item.quantity}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Financial Totals */}
        <div className="border-t border-slate-200 pt-4 flex flex-col items-end space-y-1.5 text-sm">
          {order.amountDiscount ? (
            <div className="flex justify-between w-48 text-slate-500 text-xs">
              <span>Discount:</span>
              <span>-₦{order.amountDiscount.toLocaleString()}</span>
            </div>
          ) : null}
          <div className="flex justify-between w-48 font-bold text-slate-900 text-base border-t border-slate-100 pt-2">
            <span>Total:</span>
            <span>₦{order.totalPrice?.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
    </PermissionGuard>
  );
};

export default AdminOrderDetailPage;
