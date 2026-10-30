import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PlusCircle,
  Package,
  ArrowLeft,
  ArrowRight,
  Star,
  Search,
  Store,
  Boxes,
} from "lucide-react";

import {
  getAdminProducts,
  getAdminCategories,
  getAdminBrands,
  getAdminVendors,
} from "@/sanity/queries/adminQueries";

import { urlFor } from "@/sanity/lib/image";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FilterBar from "@/components/dashboard/FilterBar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import AdminProductRowActions from "@/components/dashboard/AdminProductRowActions";

interface AdminProductsPageProps {
  searchParams: Promise<{
    query?: string;
    categoryId?: string;
    brandId?: string;
    vendorId?: string;
    status?: string;
    page?: string;
  }>;
}

const AdminProductsPage = async ({
  searchParams,
}: AdminProductsPageProps) => {
  const sp = await searchParams;

  const parsedPage = Number.parseInt(sp.page || "1", 10);
  const page =
    Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [productsData, categories, brands, vendors] = await Promise.all([
    getAdminProducts({
      query: sp.query,
      categoryId: sp.categoryId,
      brandId: sp.brandId,
      vendorId: sp.vendorId,
      status: sp.status,
      page,
      limit: 15,
    }),
    getAdminCategories(),
    getAdminBrands(),
    getAdminVendors(),
  ]);

  const { products, total, totalPages } = productsData;

  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "New", value: "new" },
        { label: "Hot", value: "hot" },
        { label: "Sale", value: "sale" },
        { label: "Available", value: "available" },
      ],
    },
    {
      key: "categoryId",
      label: "Category",
      options: categories.map((category: { _id: string; title: string }) => ({
        label: category.title,
        value: category._id,
      })),
    },
    {
      key: "brandId",
      label: "Brand",
      options: brands.map((brand: { _id: string; title: string }) => ({
        label: brand.title,
        value: brand._id,
      })),
    },
    {
      key: "vendorId",
      label: "Vendor",
      options: vendors.map(
        (vendor: { _id: string; businessName: string }) => ({
          label: vendor.businessName,
          value: vendor._id,
        })
      ),
    },
  ];

  // Preserve every active filter when navigating between pages.
  const getPaginationUrl = (nextPage: number) => {
    const params = new URLSearchParams();

    if (sp.query) params.set("query", sp.query);
    if (sp.categoryId) params.set("categoryId", sp.categoryId);
    if (sp.brandId) params.set("brandId", sp.brandId);
    if (sp.vendorId) params.set("vendorId", sp.vendorId);
    if (sp.status) params.set("status", sp.status);

    params.set("page", String(nextPage));

    return `/admin/products?${params.toString()}`;
  };

  const hasProducts = products.length > 0;

  return (
    <div className="space-y-6 pb-12 sm:space-y-7">
      {/* Page heading */}
      <DashboardHeader
        title="Products Management"
        description="Manage marketplace products, monitor stock, and oversee listings across your vendors."
      >
        <Link
          href="/admin/products/new"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-shop-dark-green px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-shop-light-green hover:shadow-md hoverEffect sm:w-auto sm:py-2.5"
        >
          <PlusCircle className="h-4 w-4" />
          Add Product
        </Link>
      </DashboardHeader>

      {/* Overview strip */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-shop-dark-green">
              <Package className="h-4 w-4" />
            </span>
            Total products
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {total.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Marketplace catalog
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-shop-darkOrange">
              <Store className="h-4 w-4" />
            </span>
            Approved vendors
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {vendors.length.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Vendors available in management
          </p>
        </div>

        <div className="col-span-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5 lg:col-span-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Boxes className="h-4 w-4" />
            </span>
            Current view
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {products.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Products on this page
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-shop-dark-green" />
            <h2 className="text-sm font-semibold text-slate-900">
              Find products
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Search the catalog or narrow results using the filters.
          </p>
        </div>

        <div className="p-4 sm:p-5">
          <FilterBar
            searchPlaceholder="Search products by title..."
            filters={filters}
          />
        </div>
      </section>

      {/* Product listing */}
      {!hasProducts ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-6">
          <EmptyState
            icon={Package}
            title="No products found"
            description="There are no products matching your current search or filters. Try adjusting your criteria or add a new product to the marketplace."
            action={
              <Link
                href="/admin/products/new"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-shop-dark-green px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-shop-light-green hoverEffect"
              >
                <PlusCircle className="h-4 w-4" />
                Add First Product
              </Link>
            }
          />
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          {/* Listing heading */}
          <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Marketplace Catalog
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Review product details, vendor attribution, pricing, and stock.
              </p>
            </div>

            <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-shop-dark-green">
              {total.toLocaleString()}{" "}
              {total === 1 ? "product" : "products"} found
            </span>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-4 py-4">Vendor</th>
                  <th className="px-4 py-4">Price</th>
                  <th className="px-4 py-4">Stock</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {products.map((product: any) => {
                  const imageUrl =
                    product.image && product.image[0]
                      ? urlFor(product.image[0])
                        .width(100)
                        .height(100)
                        .url()
                      : null;

                  return (
                    <tr
                      key={product._id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      {/* Product */}
                      <td className="px-5 py-4">
                        <div className="flex min-w-[220px] items-center gap-3">
                          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={product.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-slate-400" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[220px] truncate font-semibold text-slate-900">
                              {product.title}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              {product.isfeatured && (
                                <span className="inline-flex items-center gap-1 rounded-md border border-orange-200 bg-orange-50 px-1.5 py-0.5 text-[10px] font-semibold text-orange-700">
                                  <Star className="h-2.5 w-2.5 fill-current" />
                                  Featured
                                </span>
                              )}

                              {product.isNew && (
                                <span className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                                  New
                                </span>
                              )}

                              {product.brand?.title && (
                                <span className="max-w-[110px] truncate text-[11px] text-slate-500">
                                  {product.brand.title}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Vendor */}
                      <td className="px-4 py-4">
                        {product.vendor ? (
                          <Link
                            href={`/admin/vendors/${product.vendor._id}`}
                            className="font-medium text-slate-700 transition-colors hover:text-shop-dark-green hover:underline"
                          >
                            {product.vendor.businessName}
                          </Link>
                        ) : (
                          <span className="text-xs italic text-slate-400">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-900">
                          ₦{product.price?.toLocaleString() ?? "0"}
                        </p>
                        {product.discount ? (
                          <p className="mt-0.5 text-xs font-medium text-rose-600">
                            {product.discount}% off
                          </p>
                        ) : null}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${product.stock === 0
                              ? "bg-rose-50 text-rose-700"
                              : product.stock <= 5
                                ? "bg-orange-50 text-orange-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                        >
                          {product.stock === 0
                            ? "Out of stock"
                            : `${product.stock} units`}
                        </span>
                      </td>

                      {/* Categories */}
                      <td className="max-w-[180px] px-4 py-4">
                        <p className="line-clamp-2 text-xs leading-5 text-slate-600">
                          {product.categories?.length
                            ? product.categories
                              .map((category: any) => category.title)
                              .join(", ")
                            : "—"}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <StatusBadge status={product.status || "available"} />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <AdminProductRowActions
                          productId={product._id}
                          productSlug={product.slug?.current}
                          productTitle={product.title}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile product cards */}
          <div className="divide-y divide-slate-100 md:hidden">
            {products.map((product: any) => {
              const imageUrl =
                product.image && product.image[0]
                  ? urlFor(product.image[0]).width(160).height(160).url()
                  : null;

              return (
                <article
                  key={product._id}
                  className="p-4 transition-colors hover:bg-slate-50/60 sm:p-5"
                >
                  <div className="flex gap-3">
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="min-w-0 flex-1 text-sm font-semibold leading-5 text-slate-900">
                          {product.title}
                        </h3>
                        <StatusBadge status={product.status || "available"} />
                      </div>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {product.vendor?.businessName || "Direct product"}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {product.isfeatured && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-[10px] font-semibold text-orange-700">
                            <Star className="h-2.5 w-2.5 fill-current" />
                            Featured
                          </span>
                        )}

                        {product.isNew && (
                          <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                            New
                          </span>
                        )}

                        {product.brand?.title && (
                          <span className="truncate text-[11px] text-slate-500">
                            {product.brand.title}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                        Selling price
                      </p>
                      <p className="mt-0.5 text-base font-bold text-slate-900">
                        ₦{product.price?.toLocaleString() ?? "0"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                        Available stock
                      </p>
                      <span
                        className={`mt-0.5 inline-flex text-sm font-semibold ${product.stock === 0
                            ? "text-rose-600"
                            : product.stock <= 5
                              ? "text-orange-600"
                              : "text-slate-700"
                          }`}
                      >
                        {product.stock === 0
                          ? "Out of stock"
                          : `${product.stock} units`}
                      </span>
                    </div>
                  </div>

                  {product.categories?.length > 0 && (
                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      <span className="font-medium text-slate-700">
                        Category:{" "}
                      </span>
                      {product.categories
                        .map((category: any) => category.title)
                        .join(", ")}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-end border-t border-slate-100 pt-3">
                    <AdminProductRowActions
                      productId={product._id}
                      productSlug={product.slug?.current}
                      productTitle={product.title}
                    />
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-slate-500 sm:text-sm">
                Page{" "}
                <span className="font-semibold text-slate-900">{page}</span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900">
                  {totalPages}
                </span>
                <span className="hidden sm:inline">
                  {" "}
                  · {total.toLocaleString()} total products
                </span>
              </p>

              <div className="flex items-center gap-2">
                {page > 1 ? (
                  <Link
                    href={getPaginationUrl(page - 1)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50 sm:flex-none"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Previous
                  </Link>
                ) : (
                  <span className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-300 sm:flex-none">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Previous
                  </span>
                )}

                {page < totalPages ? (
                  <Link
                    href={getPaginationUrl(page + 1)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-shop-dark-green px-3 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-shop-light-green sm:flex-none"
                  >
                    Next
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <span className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-300 sm:flex-none">
                    Next
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default AdminProductsPage;