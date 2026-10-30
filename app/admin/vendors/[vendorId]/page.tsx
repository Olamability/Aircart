
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Store,
  Mail,
  Calendar,
  Package,
  ShoppingBag,
  ArrowLeft,
  ExternalLink,
  Edit,
  Boxes,
  Plus,
  ArrowUpRight,
} from "lucide-react";

import { getAdminVendorDetail } from "@/sanity/queries/adminQueries";
import { urlFor } from "@/sanity/lib/image";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import StatsCard from "@/components/dashboard/StatsCard";
import VendorStatusActions from "@/components/dashboard/VendorStatusActions";
import { PermissionGuard } from "@/lib/permissionGuard";
import { permissions } from "@/lib/permissions";

interface AdminVendorDetailPageProps {
  params: Promise<{ vendorId: string }>;
}

const AdminVendorDetailPage = async ({
  params,
}: AdminVendorDetailPageProps) => {
  const { vendorId } = await params;
  const data = await getAdminVendorDetail(vendorId);

  if (!data || !data.vendor) {
    notFound();
  }

  const { vendor, products, productCount, orderCount } = data;

  const logoUrl =
    vendor.logo && vendor.logo.asset
      ? urlFor(vendor.logo).width(240).height(240).url()
      : null;

  const memberSince = vendor.createdAt
    ? new Date(vendor.createdAt).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })
    : "—";

  const vendorStatus = vendor.status || "pending";

  const formattedStatus =
    vendorStatus.charAt(0).toUpperCase() + vendorStatus.slice(1);

  return (
    <PermissionGuard permission={permissions.vendors_view}>
      <div className="space-y-7 pb-12">
        {/* Back navigation */}
        <Link
          href="/admin/vendors"
          className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-shop-dark-green"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white transition-all group-hover:border-shop-dark-green/20 group-hover:bg-shop-dark-green/5">
            <ArrowLeft className="h-4 w-4" />
          </span>
          Back to Vendors
        </Link>

        {/* Page header */}
        <DashboardHeader
          title={vendor.businessName}
          description={
            vendor.description ||
            "Registered marketplace merchant store."
          }
          badge={<StatusBadge status={vendorStatus} />}
        >
          <VendorStatusActions
            vendorId={vendor._id}
            vendorName={vendor.businessName}
            currentStatus={vendorStatus}
          />
        </DashboardHeader>

        {/* Vendor profile and statistics */}
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Vendor profile card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-4">
            <div className="h-2 bg-gradient-to-r from-shop-dark-green via-shop-light-green to-shop-darkOrange" />

            <div className="flex flex-col items-center px-5 py-7 text-center sm:px-7">
              <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={`${vendor.businessName} logo`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <Store className="h-10 w-10 text-shop-dark-green/40" />
                )}
              </div>

              <h2 className="mt-4 max-w-full break-words text-lg font-bold text-slate-900">
                {vendor.businessName}
              </h2>

              <div className="mt-2 inline-flex max-w-full items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{vendor.email}</span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>Member since {memberSince}</span>
              </div>

              <div className="mt-5 flex w-full flex-col gap-2 border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Account status</span>
                  <StatusBadge status={vendorStatus} />
                </div>

                {vendor.slug?.current && (
                  <Link
                    href={`/vendor/${vendor.slug.current}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-shop-dark-green/20 bg-shop-dark-green/5 px-4 py-2.5 text-sm font-semibold text-shop-dark-green transition-all hover:border-shop-dark-green hover:bg-shop-dark-green hover:text-white"
                  >
                    View Public Storefront
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Vendor statistics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
            <StatsCard
              title="Catalog Size"
              value={productCount}
              icon={Package}
              color="green"
              description="Products in this vendor's catalog"
            />

            <StatsCard
              title="Store Orders"
              value={orderCount}
              icon={ShoppingBag}
              color="purple"
              description="Orders containing store items"
            />

            <StatsCard
              title="Merchant Status"
              value={formattedStatus}
              icon={Store}
              color={
                vendorStatus === "approved"
                  ? "green"
                  : vendorStatus === "suspended"
                    ? "rose"
                    : "amber"
              }
              description="Current account clearance"
            />

            {/* Additional profile information */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:col-span-2 lg:col-span-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-shop-dark-green/10 text-shop-dark-green">
                <Boxes className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  Merchant catalog overview
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Review the products associated with this vendor, monitor
                  their listing status, and access product editing.
                </p>
              </div>

              <div className="hidden text-right sm:block">
                <p className="text-2xl font-bold tabular-nums text-shop-dark-green">
                  {products.length}
                </p>
                <p className="text-[11px] text-slate-400">
                  Loaded products
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Vendor products */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Products header */}
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-shop-dark-green/10 text-shop-dark-green">
                  <Package className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Vendor Products
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Products managed under this merchant account
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {products.length} {products.length === 1 ? "Product" : "Products"}
              </span>

              <Link
                href="/admin/products/new"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-shop-dark-green px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-shop-light-green hover:shadow-md"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Link>
            </div>
          </div>

          {/* Empty state */}
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Package className="h-7 w-7" />
              </div>

              <h4 className="mt-4 text-sm font-semibold text-slate-800">
                No products yet
              </h4>

              <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                This vendor has not published any products. Products
                associated with this merchant will appear here.
              </p>

              <Link
                href="/admin/products/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-shop-dark-green/20 px-4 py-2.5 text-xs font-semibold text-shop-dark-green transition-colors hover:bg-shop-dark-green hover:text-white"
              >
                <Plus className="h-4 w-4" />
                Create a Product
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop product table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[650px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Product
                      </th>
                      <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Price
                      </th>
                      <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Stock
                      </th>
                      <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                      <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {products.map((product: any) => {
                      const productImage =
                        product.image && product.image[0]
                          ? urlFor(product.image[0])
                            .width(120)
                            .height(120)
                            .url()
                          : null;

                      return (
                        <tr
                          key={product._id}
                          className="group transition-colors hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                {productImage ? (
                                  <Image
                                    src={productImage}
                                    alt={product.title || "Product"}
                                    fill
                                    sizes="48px"
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <Package className="h-5 w-5 text-slate-300" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-xs truncate text-sm font-semibold text-slate-800">
                                  {product.title}
                                </p>
                                <p className="mt-1 text-[11px] text-slate-400">
                                  Product ID: {product._id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-700">
                            ₦{product.price?.toLocaleString()}
                          </td>

                          <td className="px-4 py-4">
                            <span className="text-sm font-medium text-slate-600">
                              {product.stock ?? "—"}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <StatusBadge
                              status={product.status || "available"}
                            />
                          </td>

                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/admin/products/${product._id}/edit`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:border-shop-dark-green/20 hover:bg-shop-dark-green/5 hover:text-shop-dark-green"
                              title="Edit Product"
                              aria-label={`Edit ${product.title}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile product cards */}
              <div className="space-y-3 p-4 md:hidden">
                {products.map((product: any) => {
                  const productImage =
                    product.image && product.image[0]
                      ? urlFor(product.image[0])
                        .width(120)
                        .height(120)
                        .url()
                      : null;

                  return (
                    <div
                      key={product._id}
                      className="rounded-xl border border-slate-200 p-3 transition-all hover:border-shop-dark-green/20 hover:shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                          {productImage ? (
                            <Image
                              src={productImage}
                              alt={product.title || "Product"}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-slate-300" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="break-words text-sm font-semibold text-slate-800">
                            {product.title}
                          </p>

                          <p className="mt-1 text-sm font-bold text-shop-dark-green">
                            ₦{product.price?.toLocaleString()}
                          </p>

                          <div className="mt-2">
                            <StatusBadge
                              status={product.status || "available"}
                            />
                          </div>
                        </div>

                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-shop-dark-green/20 hover:bg-shop-dark-green/5 hover:text-shop-dark-green"
                          title="Edit Product"
                          aria-label={`Edit ${product.title}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                        <span className="text-slate-500">Available stock</span>
                        <span className="font-semibold text-slate-700">
                          {product.stock ?? "—"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* Footer navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
          <p className="text-xs text-slate-500">
            Managing <span className="font-semibold text-slate-700">{vendor.businessName}</span>
          </p>

          <Link
            href="/admin/vendors"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-shop-dark-green transition-colors hover:text-shop-light-green"
          >
            All Vendors
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </PermissionGuard>
  );
};

export default AdminVendorDetailPage;
