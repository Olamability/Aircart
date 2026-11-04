import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Boxes, AlertTriangle, XCircle, CheckCircle2, Store, Building, Pencil, Package } from "lucide-react";
import { getAdminInventory } from "@/sanity/queries/adminQueries";
import { urlFor } from "@/sanity/lib/image";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import FilterBar from "@/components/dashboard/FilterBar";
import EmptyState from "@/components/dashboard/EmptyState";
import { StockAdjustInput } from "@/components/dashboard/StockAdjustInput";
import { PermissionGuard } from "@/lib/permissionGuard";
import { permissions } from "@/lib/permissions";

interface AdminInventoryPageProps {
  searchParams: Promise<{
    query?: string;
    stockStatus?: string;
    ownership?: string;
  }>;
}

const AdminInventoryPage = async ({ searchParams }: AdminInventoryPageProps) => {
  const sp = await searchParams;
  const { products, totalCount, lowStockCount, outOfStockCount } = await getAdminInventory({
    query: sp.query,
    stockStatus: sp.stockStatus,
    ownership: sp.ownership,
  });

  const platformOwnedCount = products.filter((p: any) => p.isPlatformOwned).length;

  const filters = [
    {
      key: "stockStatus",
      label: "Stock Level",
      options: [
        { label: "All Levels", value: "all" },
        { label: "Low Stock (≤ 5)", value: "low" },
        { label: "Out of Stock (0)", value: "out" },
        { label: "Healthy (> 5)", value: "in_stock" },
      ],
    },
    {
      key: "ownership",
      label: "Ownership",
      options: [
        { label: "All Listings", value: "all" },
        { label: "Platform Direct", value: "platform" },
        { label: "Vendor Listings", value: "vendor" },
      ],
    },
  ];

  return (
    <PermissionGuard permission={permissions.inventory_view}>
      <div className="space-y-6 pb-12">
        <DashboardHeader
          title="Inventory & Stock Management"
          description="Cross-platform inventory control across in-house inventory and merchant listings with live stock adjustments."
        />

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Catalog SKUs"
            value={totalCount}
            icon={Boxes}
            color="green"
            description="Active inventory listings"
          />
          <StatsCard
            title="Low Stock Alerts"
            value={lowStockCount}
            icon={AlertTriangle}
            color="amber"
            description="5 or fewer units remaining"
          />
          <StatsCard
            title="Out of Stock"
            value={outOfStockCount}
            icon={XCircle}
            color="rose"
            description="Immediate restocking required"
          />
          <StatsCard
            title="Platform Products"
            value={platformOwnedCount}
            icon={Building}
            color="blue"
            description="Direct marketplace inventory"
          />
        </div>

        <FilterBar searchPlaceholder="Search products by title..." filters={filters} />

        {products.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="No inventory records found"
            description="No catalog products match the specified stock level or ownership filters."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Product</th>
                    <th className="px-4 py-3.5">Ownership</th>
                    <th className="px-4 py-3.5">Price</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Current Stock</th>
                    <th className="px-4 py-3.5">Adjust Stock</th>
                    <th className="px-5 py-3.5 text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((prod: any) => {
                    const imgUrl =
                      prod.image && prod.image[0]
                        ? urlFor(prod.image[0]).width(80).height(80).url()
                        : null;

                    return (
                      <tr key={prod._id} className="hover:bg-slate-50/75 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-11 w-11 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shrink-0">
                              {imgUrl ? (
                                <Image src={imgUrl} alt={prod.title} fill className="object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-slate-400">
                                  <Package className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <Link
                                href={`/admin/products/${prod._id}/edit`}
                                className="font-medium text-slate-900 hover:text-shop-dark-green line-clamp-1 max-w-[220px]"
                              >
                                {prod.title}
                              </Link>
                              <span className="text-[11px] text-slate-400 font-mono">
                                ID: {prod._id.slice(0, 10)}...
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          {prod.isPlatformOwned ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-shop-dark-green border border-emerald-200/60">
                              <Building className="h-3 w-3" /> Platform
                            </span>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-slate-700">
                              <Store className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[140px]">
                                {prod.vendor?.businessName || "Merchant"}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-4 font-semibold text-slate-900 font-mono">
                          ₦{prod.price?.toLocaleString()}
                        </td>

                        <td className="px-4 py-4">
                          {prod.isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                              Out of stock
                            </span>
                          ) : prod.isLowStock ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                              Low stock ({prod.stock})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              In stock ({prod.stock})
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4 font-mono font-bold text-slate-900">
                          {prod.stock} units
                        </td>

                        <td className="px-4 py-4">
                          <StockAdjustInput
                            productId={prod._id}
                            currentStock={prod.stock}
                            productTitle={prod.title}
                          />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/admin/products/${prod._id}/edit`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {products.map((prod: any) => (
                <div key={prod._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/admin/products/${prod._id}/edit`}
                        className="font-medium text-slate-900 text-sm hover:text-shop-dark-green block line-clamp-1"
                      >
                        {prod.title}
                      </Link>
                      <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                        ₦{prod.price?.toLocaleString()}
                      </span>
                    </div>

                    {prod.isPlatformOwned ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-shop-dark-green border border-emerald-200">
                        Platform
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[120px]">
                        {prod.vendor?.businessName || "Vendor"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <div>
                      {prod.isOutOfStock ? (
                        <span className="text-rose-600 font-bold">Out of stock (0)</span>
                      ) : prod.isLowStock ? (
                        <span className="text-amber-600 font-bold">Low stock ({prod.stock})</span>
                      ) : (
                        <span className="text-emerald-700 font-bold">In stock ({prod.stock})</span>
                      )}
                    </div>

                    <StockAdjustInput
                      productId={prod._id}
                      currentStock={prod.stock}
                      productTitle={prod.title}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
};

export default AdminInventoryPage;

