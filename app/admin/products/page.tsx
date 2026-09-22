import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PlusCircle, Package, ArrowLeft, ArrowRight, Star } from "lucide-react";
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

const AdminProductsPage = async ({ searchParams }: AdminProductsPageProps) => {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) : 1;

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
      options: categories.map((c: { _id: string; title: string }) => ({
        label: c.title,
        value: c._id,
      })),
    },
    {
      key: "brandId",
      label: "Brand",
      options: brands.map((b: { _id: string; title: string }) => ({
        label: b.title,
        value: b._id,
      })),
    },
    {
      key: "vendorId",
      label: "Vendor",
      options: vendors.map((v: { _id: string; businessName: string }) => ({
        label: v.businessName,
        value: v._id,
      })),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <DashboardHeader
        title="Products Management"
        description="View, search, filter, and oversee marketplace catalog products across all vendors."
      >
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-shop-dark-green px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-shop-light-green hoverEffect"
        >
          <PlusCircle className="h-4 w-4" />
          Add Product
        </Link>
      </DashboardHeader>

      {/* Filter and Search Bar */}
      <FilterBar searchPlaceholder="Search products by title..." filters={filters} />

      {/* Product List Table / Card Grid */}
      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description="Try adjusting your search criteria or add a new product to the marketplace catalog."
          action={
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 rounded-lg bg-shop-dark-green px-4 py-2 text-sm font-semibold text-white hover:bg-shop-light-green hoverEffect"
            >
              <PlusCircle className="h-4 w-4" />
              Add First Product
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-4 py-3.5">Vendor</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">Stock</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product: any) => {
                  const imageUrl =
                    product.image && product.image[0]
                      ? urlFor(product.image[0]).width(80).height(80).url()
                      : null;

                  return (
                    <tr key={product._id} className="hover:bg-slate-50/75 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 relative">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={product.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="max-w-[220px]">
                            <span className="font-medium text-slate-900 line-clamp-1">
                              {product.title}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {product.isfeatured && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                                  <Star className="h-2.5 w-2.5 fill-current" /> Featured
                                </span>
                              )}
                              {product.isNew && (
                                <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded">
                                  New
                                </span>
                              )}
                              {product.brand && (
                                <span className="text-xs text-slate-500 truncate">
                                  {product.brand.title}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-xs font-medium text-slate-700">
                        {product.vendor ? (
                          <Link
                            href={`/admin/vendors/${product.vendor._id}`}
                            className="hover:text-shop-dark-green hover:underline"
                          >
                            {product.vendor.businessName}
                          </Link>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">
                          ₦{product.price?.toLocaleString()}
                        </div>
                        {product.discount ? (
                          <span className="text-xs text-rose-600 font-medium">
                            -{product.discount}% off
                          </span>
                        ) : null}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            product.stock === 0
                              ? "bg-rose-50 text-rose-700 font-semibold"
                              : product.stock <= 5
                              ? "bg-amber-50 text-amber-700 font-semibold"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {product.stock === 0 ? "Out of stock" : `${product.stock} units`}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-600">
                        {product.categories?.length
                          ? product.categories.map((c: any) => c.title).join(", ")
                          : "—"}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={product.status || "available"} />
                      </td>

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

          {/* Mobile Card Layout */}
          <div className="md:hidden divide-y divide-slate-100">
            {products.map((product: any) => (
              <div key={product._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-medium text-slate-900">{product.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Vendor: {product.vendor?.businessName || "Direct"}
                    </p>
                  </div>
                  <StatusBadge status={product.status || "available"} />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-900">
                    ₦{product.price?.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Stock: {product.stock}
                  </span>
                </div>

                <div className="flex items-center justify-end border-t border-slate-100 pt-2">
                  <AdminProductRowActions
                    productId={product._id}
                    productSlug={product.slug?.current}
                    productTitle={product.title}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-sm text-slate-500">
              <span>
                Showing page {page} of {totalPages} ({total} total)
              </span>
              <div className="flex items-center gap-2">
                {page > 1 ? (
                  <Link
                    href={`/admin/products?page=${page - 1}${sp.query ? `&query=${sp.query}` : ""}${sp.categoryId ? `&categoryId=${sp.categoryId}` : ""}${sp.status ? `&status=${sp.status}` : ""}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Previous
                  </Link>
                ) : null}
                {page < totalPages ? (
                  <Link
                    href={`/admin/products?page=${page + 1}${sp.query ? `&query=${sp.query}` : ""}${sp.categoryId ? `&categoryId=${sp.categoryId}` : ""}${sp.status ? `&status=${sp.status}` : ""}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Next <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
