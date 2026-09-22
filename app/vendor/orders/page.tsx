import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Package, Truck, ArrowRight } from "lucide-react";
import { getCurrentVendor } from "@/lib/vendor";
import { getVendorOrders } from "@/sanity/queries/vendorQueries";
import { urlFor } from "@/sanity/lib/image";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FilterBar from "@/components/dashboard/FilterBar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";

interface VendorOrdersPageProps {
  searchParams: Promise<{
    query?: string;
    status?: string;
  }>;
}

const VendorOrdersPage = async ({ searchParams }: VendorOrdersPageProps) => {
  const vendor = await getCurrentVendor();

  if (!vendor) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Merchant account not found"
        description="Please complete your merchant onboarding profile to receive customer orders."
      />
    );
  }

  const sp = await searchParams;
  const orders = await getVendorOrders(vendor._id, {
    query: sp.query,
    status: sp.status,
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
  ];

  return (
    <div className="space-y-6 pb-12">
      <DashboardHeader
        title="Store Orders"
        description="Customer orders specifically containing your merchant catalog products."
      >
        <Link
          href="/vendor/shipping"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
        >
          <Truck className="h-4 w-4 text-emerald-600" />
          Shipping Management
        </Link>
      </DashboardHeader>

      <FilterBar searchPlaceholder="Search by order # or customer..." filters={filters} />

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No store orders found"
          description="Orders for your products will appear here when customers complete checkout."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((ord: any) => {
            const orderTotal = (ord.storeItems || []).reduce(
              (acc: number, it: any) => acc + (it.price || 0) * (it.quantity || 1),
              0
            );

            return (
              <div
                key={ord._id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      #{ord.orderNumber ? ord.orderNumber.slice(-8) : ord._id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      {ord.createdAt
                        ? new Date(ord.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={ord.paymentStatus || "pending"} />
                    <StatusBadge status={ord.status || "pending"} />
                  </div>
                </div>

                {/* Customer & Destination Summary */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-600">
                  <div>
                    <span className="font-medium text-slate-900">Buyer:</span> {ord.customerName}
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">Ship To:</span>{" "}
                    {ord.address ? `${ord.address.city}, ${ord.address.state}` : "Direct Dispatch"}
                  </div>
                </div>

                {/* Vendor's Line Items */}
                <div className="divide-y divide-slate-100 bg-slate-50/50 rounded-lg p-3">
                  {(ord.storeItems || []).map((it: any, idx: number) => {
                    const img =
                      it.product?.image && it.product.image[0]
                        ? urlFor(it.product.image[0]).width(48).height(48).url()
                        : null;

                    return (
                      <div
                        key={idx}
                        className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="relative h-8 w-8 rounded border border-slate-200 bg-white overflow-hidden shrink-0">
                            {img ? (
                              <Image src={img} alt="Product" fill className="object-cover" />
                            ) : (
                              <Package className="h-4 w-4 m-auto text-slate-400" />
                            )}
                          </div>
                          <span className="text-xs font-medium text-slate-800 line-clamp-1">
                            {it.product?.title || "Product item"}
                          </span>
                        </div>

                        <div className="text-right text-xs">
                          <span className="font-semibold text-slate-900">
                            ₦{it.price?.toLocaleString()}
                          </span>
                          <span className="text-slate-500 ml-2">× {it.quantity}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer with subtotal */}
                <div className="flex items-center justify-between pt-1 text-sm border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    Store items total (gross):
                  </span>
                  <span className="font-bold text-slate-900 text-base">
                    ₦{orderTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VendorOrdersPage;
