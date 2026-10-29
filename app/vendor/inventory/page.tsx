import React from "react";
import Link from "next/link";
import { Warehouse, PlusCircle, AlertTriangle, UserCheck } from "lucide-react";
import { getCurrentVendor } from "@/lib/vendor";
import { getVendorInventory } from "@/sanity/queries/vendorQueries";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FilterBar from "@/components/dashboard/FilterBar";
import EmptyState from "@/components/dashboard/EmptyState";
import VendorMissingProfileState from "@/components/dashboard/VendorMissingProfileState";
import VendorInventoryTable from "@/components/dashboard/VendorInventoryTable";
import StatusBadge from "@/components/dashboard/StatusBadge";

interface VendorInventoryPageProps {
  searchParams: Promise<{
    query?: string;
    stockLevel?: string;
  }>;
}

const VendorInventoryPage = async ({ searchParams }: VendorInventoryPageProps) => {
  const vendor = await getCurrentVendor();

  if (!vendor) {
    return (
      <VendorMissingProfileState
        icon={Warehouse}
        title="Merchant profile required"
        description="Please configure your vendor store profile first to track and manage product inventory."
      />
    );
  }

  if (vendor.status === "pending") {
    return (
      <div className="space-y-6 pb-12">
        <DashboardHeader
          title="Store Inventory Management"
          description="Track product stock counts in real time, monitor depletion alerts, and adjust quantities."
          badge={<StatusBadge status="pending" />}
        />
        <EmptyState
          icon={Warehouse}
          title="Inventory tracking locked"
          description="Inventory management will be enabled once your merchant store application has been approved by an administrator."
          action={
            <Link
              href="/vendor/profile"
              className="inline-flex items-center gap-2 rounded-lg bg-shop-dark-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-shop-light-green transition"
            >
              <UserCheck className="h-4 w-4" />
              View Store Profile
            </Link>
          }
        />
      </div>
    );
  }

  if (vendor.status === "suspended") {
    return (
      <div className="space-y-6 pb-12">
        <DashboardHeader
          title="Store Inventory Management"
          description="Track product stock counts in real time, monitor depletion alerts, and adjust quantities."
          badge={<StatusBadge status="suspended" />}
        />
        <EmptyState
          icon={AlertTriangle}
          title="Inventory management suspended"
          description="Stock updates and inventory adjustments are disabled while your merchant account is suspended."
        />
      </div>
    );
  }

  const sp = await searchParams;
  const products = await getVendorInventory(vendor._id, {
    query: sp.query,
    stockLevel: sp.stockLevel,
  });

  const filters = [
    {
      key: "stockLevel",
      label: "Stock Level",
      options: [
        { label: "Low Stock (<= 5)", value: "low" },
        { label: "Out of Stock (0)", value: "out" },
        { label: "In Stock (> 5)", value: "in" },
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <DashboardHeader
        title="Store Inventory Management"
        description="Track product stock counts in real time, monitor depletion alerts, and adjust quantities."
      >
        <Link
          href="/vendor/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-shop-dark-green px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-shop-light-green transition"
        >
          <PlusCircle className="h-4 w-4" />
          Add Product
        </Link>
      </DashboardHeader>

      <FilterBar searchPlaceholder="Search inventory by title..." filters={filters} />

      {products.length === 0 ? (
        <EmptyState
          icon={Warehouse}
          title="No inventory records found"
          description="Try adjusting your filter or add items to your store catalog."
        />
      ) : (
        <VendorInventoryTable products={products} />
      )}
    </div>
  );
};

export default VendorInventoryPage;
