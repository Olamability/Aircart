
import React from "react";
import Link from "next/link";
import {
  PlusCircle,
  Package,
  Clock,
  AlertTriangle,
  UserCheck,
  Boxes,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  SearchX,
} from "lucide-react";

import { getCurrentVendor } from "@/lib/vendor";
import { getCurrentVendorProducts } from "@/lib/vendorProduct";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FilterBar from "@/components/dashboard/FilterBar";
import EmptyState from "@/components/dashboard/EmptyState";
import VendorProductCard from "@/components/dashboard/VendorProductCard";
import VendorMissingProfileState from "@/components/dashboard/VendorMissingProfileState";
import StatusBadge from "@/components/dashboard/StatusBadge";

interface VendorProductsPageProps {
  searchParams: Promise<{
    query?: string;
    status?: string;
    stock?: string;
  }>;
}

const VendorProductsPage = async ({
  searchParams,
}: VendorProductsPageProps) => {
  const vendor = await getCurrentVendor();

  if (!vendor) {
    return (
      <VendorMissingProfileState
        icon={Package}
        title="Merchant profile required"
        description="Your merchant profile has not been configured yet. Set up your store profile to begin listing and managing products."
      />
    );
  }

  // Pending vendors cannot manage their product catalog.
  if (vendor.status === "pending") {
    return (
      <div className="space-y-6 pb-12">
        <DashboardHeader
          title="My Products"
          description="Manage your marketplace products from here."
          badge={<StatusBadge status="pending" />}
        />

        <EmptyState
          icon={Clock}
          title="Product listing locked"
          description="Your merchant application is currently pending administrative approval. You will be able to add and manage catalog products once approved."
          action={
            <Link
              href="/vendor/profile"
              className="inline-flex items-center gap-2 rounded-xl bg-shop-dark-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-shop-light-green hover:shadow-md"
            >
              <UserCheck className="h-4 w-4" />
              View Store Profile
            </Link>
          }
        />
      </div>
    );
  }

  // Suspended vendors cannot create or update products.
  if (vendor.status === "suspended") {
    return (
      <div className="space-y-6 pb-12">
        <DashboardHeader
          title="My Products"
          description="Manage your marketplace products from here."
          badge={<StatusBadge status="suspended" />}
        />

        <EmptyState
          icon={AlertTriangle}
          title="Store products suspended"
          description="Your store catalog is temporarily suspended. Product creation and updates are disabled."
        />
      </div>
    );
  }

  const sp = await searchParams;
  const products = await getCurrentVendorProducts();

  // Search products by title, brand, or category.
  let filteredProducts = products;

  if (sp.query && sp.query.trim()) {
    const q = sp.query.trim().toLowerCase();

    filteredProducts = filteredProducts.filter((product) => {
      const matchTitle = product.title?.toLowerCase().includes(q);
      const matchBrand = product.brand?.title?.toLowerCase().includes(q);
      const matchCategory = product.categories?.some((category) =>
        category.title.toLowerCase().includes(q)
      );

      return matchTitle || matchBrand || matchCategory;
    });
  }

  // Filter by product status.
  if (sp.status && sp.status !== "all") {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.status?.toLowerCase() === sp.status?.toLowerCase()
    );
  }

  // Filter by inventory level.
  if (sp.stock && sp.stock !== "all") {
    if (sp.stock === "low") {
      filteredProducts = filteredProducts.filter(
        (product) =>
          (product.stock ?? 0) > 0 && (product.stock ?? 0) <= 5
      );
    } else if (sp.stock === "out") {
      filteredProducts = filteredProducts.filter(
        (product) => (product.stock ?? 0) === 0
      );
    } else if (sp.stock === "in") {
      filteredProducts = filteredProducts.filter(
        (product) => (product.stock ?? 0) > 5
      );
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

  // Inventory overview uses the complete product list, not filtered results.
  const totalProducts = products.length;
  const lowStockCount = products.filter(
    (product) => (product.stock ?? 0) > 0 && (product.stock ?? 0) <= 5
  ).length;
  const outOfStockCount = products.filter(
    (product) => (product.stock ?? 0) === 0
  ).length;
  const inStockCount = products.filter(
    (product) => (product.stock ?? 0) > 5
  ).length;

  return (
    <div className="space-y-7 pb-12">
      {/* Page header */}
      <DashboardHeader
        title="My Products"
        description="Manage your marketplace catalog, monitor inventory, and keep your products up to date."
      >
        <Link
          href="/vendor/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-shop-dark-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-shop-light-green hover:shadow-md"
        >
          <PlusCircle className="h-4 w-4" />
          Add Product
        </Link>
      </DashboardHeader>

      {/* Inventory overview */}
      <section>
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Inventory Overview
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              A snapshot of your current product inventory.
            </p>
          </div>

          <span className="text-xs text-slate-400">
            {totalProducts} total {totalProducts === 1 ? "product" : "products"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-shop-dark-green/20 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-shop-dark-green/10 text-shop-dark-green">
                <Boxes className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                Total catalog
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold tabular-nums text-slate-900">
              {totalProducts}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              All listed products
            </p>
          </div>

          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                Healthy inventory
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold tabular-nums text-slate-900">
              {inStockCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              More than 5 units available
            </p>
          </div>

          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <TrendingDown className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                Attention needed
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold tabular-nums text-slate-900">
              {lowStockCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Between 1 and 5 units remaining
            </p>
          </div>

          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                Unavailable
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold tabular-nums text-slate-900">
              {outOfStockCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Products with zero stock
            </p>
          </div>
        </div>
      </section>

      {/* Product catalog section */}
      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Your Product Catalog
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Search, filter, and manage the products in your store.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
            <Package className="h-3.5 w-3.5 text-shop-dark-green" />
            {filteredProducts.length} of {totalProducts} products
          </div>
        </div>

        {/* Search and filters */}
        {products.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <FilterBar
              searchPlaceholder="Search products by title, brand, or category..."
              filters={filters}
            />
          </div>
        )}

        {/* Product listing */}
        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products yet"
            description="You haven't listed any products in your store yet. Start selling by adding your first product to the marketplace catalog."
            action={
              <Link
                href="/vendor/products/new"
                className="inline-flex items-center gap-2 rounded-xl bg-shop-dark-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-shop-light-green hover:shadow-md"
              >
                <PlusCircle className="h-4 w-4" />
                Add Your First Product
              </Link>
            }
          />
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <SearchX className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-800">
              No matching products
            </h3>

            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500">
              No store products matched your active search or filter
              criteria. Try changing your search terms or clearing your filters.
            </p>

            <Link
              href="/vendor/products"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-shop-dark-green/20 px-4 py-2.5 text-xs font-semibold text-shop-dark-green transition-colors hover:bg-shop-dark-green hover:text-white"
            >
              Clear all filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <VendorProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default VendorProductsPage;
