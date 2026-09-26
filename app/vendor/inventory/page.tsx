import React from "react";
import Link from "next/link";
import { Warehouse, PlusCircle } from "lucide-react";
import { getCurrentVendor } from "@/lib/vendor";
import { getVendorInventory } from "@/sanity/queries/vendorQueries";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FilterBar from "@/components/dashboard/FilterBar";
import EmptyState from "@/components/dashboard/EmptyState";
import VendorMissingProfileState from "@/components/dashboard/VendorMissingProfileState";
import VendorInventoryTable from "@/components/dashboard/VendorInventoryTable";

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
