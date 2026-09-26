import React from "react";
import Link from "next/link";
import { Truck, PackageCheck, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { getCurrentVendor } from "@/lib/vendor";
import { getVendorOrders } from "@/sanity/queries/vendorQueries";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import VendorMissingProfileState from "@/components/dashboard/VendorMissingProfileState";

const VendorShippingPage = async () => {
  const vendor = await getCurrentVendor();

  if (!vendor) {
    return (
      <VendorMissingProfileState
        icon={Truck}
        title="Merchant profile required"
        description="Please complete your merchant profile to manage shipping and coordinate dispatch."
      />
    );
  }

  const orders = await getVendorOrders(vendor._id);

  const awaitingDispatch = orders.filter((o: any) => o.status === "processing" || o.status === "pending");
  const inTransit = orders.filter((o: any) => o.status === "shipped" || o.status === "out_for_delivery");
  const completed = orders.filter((o: any) => o.status === "delivered");

  return (
    <div className="space-y-8 pb-12">
      <DashboardHeader
        title="Shipping & Dispatch Center"
        description="Fulfill merchant orders, print parcel labels, and coordinate regional courier logistics."
      />

      {/* Shipping Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Awaiting Dispatch"
          value={awaitingDispatch.length}
          icon={Clock}
          color="amber"
          description="Needs packing & parcel label"
        />
        <StatsCard
          title="In Transit"
          value={inTransit.length}
          icon={Truck}
          color="blue"
          description="En route to customer"
        />
        <StatsCard
          title="Delivered"
          value={completed.length}
          icon={CheckCircle2}
          color="green"
          description="Completed deliveries"
        />
      </div>

      {/* Dispatch Work Queue */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Orders Awaiting Fulfillment ({awaitingDispatch.length})
        </h3>

        {awaitingDispatch.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            All customer shipments are up to date!
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {awaitingDispatch.map((ord: any) => (
              <div key={ord._id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    #{ord.orderNumber ? ord.orderNumber.slice(-8) : ord._id.slice(0, 8)}
                  </span>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Customer: {ord.customerName} • {ord.address ? `${ord.address.city}, ${ord.address.state}` : "Standard Shipping"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Items: {(ord.storeItems || []).length} parcel line items
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={ord.status || "pending"} />
                  <Link
                    href="/vendor/orders"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Manage Dispatch <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Courier Integrations Banner */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
          <PackageCheck className="h-4 w-4 text-emerald-600" />
          Airmart Merchant Logistics Protocol
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          Merchants are responsible for securely packaging merchandise and dispatching parcels within 24–48 hours of order placement. Supported logistics partners include GIG Logistics, DHL Express, and local registered dispatch riders.
        </p>
      </div>
    </div>
  );
};

export default VendorShippingPage;
