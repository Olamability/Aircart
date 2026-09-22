import React from "react";
import Link from "next/link";
import { PlusCircle, Package } from "lucide-react";
import { getCurrentVendorProducts } from "@/lib/vendorProducts";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FilterBar from "@/components/dashboard/FilterBar";
import EmptyState from "@/components/dashboard/EmptyState";
import VendorProductCard from "@/components/dashboard/VendorProductCard";

interface VendorProductsPageProps {
  searchParams: Promise<{
    query?: string;
    status?: string;
    stock?: string;
  }>;
}

const VendorProductsPage = async ({ searchParams }: VendorProductsPageProps) => {
  const sp = await searchParams;
  const products = await getCurrentVendorProducts();

  // In-memory filter based on URL searchParams
  let filteredProducts = products;

  if (sp.query && sp.query.trim()) {
    const q = sp.query.trim().toLowerCase();
    filteredProducts = filteredProducts.filter((p) => {
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchBrand = p.brand?.title?.toLowerCase().includes(q);
      const matchCategory = p.categories?.some((c) =>
        c.title.toLowerCase().includes(q)
      );
      return matchTitle || matchBrand || matchCategory;
    });
  }

  if (sp.status && sp.status !== "all") {
    filteredProducts = filteredProducts.filter(
      (p) => p.status?.toLowerCase() === sp.status?.toLowerCase()
    );
  }

  if (sp.stock && sp.stock !== "all") {
    if (sp.stock === "low") {
      filteredProducts = filteredProducts.filter(
        (p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5
      );
    } else if (sp.stock === "out") {
      filteredProducts = filteredProducts.filter((p) => (p.stock ?? 0) === 0);
    } else if (sp.stock === "in") {
      filteredProducts = filteredProducts.filter((p) => (p.stock ?? 0) > 5);
    }
  }

  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Available", value: "available" },
        { label: "New", value: "new" },
        { label: "Hot", value: "hot" },
        { label: "Sale", value: "sale" },
      ],
    },
    {
      key: "stock",
      label: "Stock Level",
      options: [
        { label: "In Stock (> 5)", value: "in" },
        { label: "Low Stock (1–5)", value: "low" },
        { label: "Out of Stock (0)", value: "out" },
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header with Action */}
      <DashboardHeader
        title="My Products"
        description="Manage your marketplace products from here."
      >
        <Link
          href="/vendor/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-shop-dark-green px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-shop-light-green hoverEffect transition"
        >
          <PlusCircle className="h-4 w-4" />
          Add Product
        </Link>
      </DashboardHeader>

      {/* Product Summary Counter */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">
          {products.length === 0 ? "0 Products" : `${filteredProducts.length} of ${products.length} Products`}
        </p>
      </div>

      {/* Filter and Search Bar */}
      {products.length > 0 && (
        <FilterBar
          searchPlaceholder="Search products by title, brand, or category..."
          filters={filters}
        />
      )}

      {/* Empty States & Product Card Grid */}
      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="You haven't listed any products in your store yet. Start selling by adding your first product to the marketplace catalog."
          action={
            <Link
              href="/vendor/products/new"
              className="inline-flex items-center gap-2 rounded-lg bg-shop-dark-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-shop-light-green hoverEffect transition"
            >
              <PlusCircle className="h-4 w-4" />
              Add Product
            </Link>
          }
        />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No matching products"
          description="No store products matched your active search or filter criteria. Try clearing or modifying your filters."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <VendorProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorProductsPage;
