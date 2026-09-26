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

const AdminVendorDetailPage = async ({ params }: AdminVendorDetailPageProps) => {
  const { vendorId } = await params;
  const data = await getAdminVendorDetail(vendorId);

  if (!data || !data.vendor) {
    notFound();
  }

  const { vendor, products, productCount, orderCount } = data;
  const logoUrl =
    vendor.logo && vendor.logo.asset
      ? urlFor(vendor.logo).width(120).height(120).url()
      : null;

  return (
    <PermissionGuard permission={permissions.vendors_view}>
      <div className="space-y-8 pb-12">
      <div className="mb-2">
        <Link
          href="/admin/vendors"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Vendors
        </Link>
      </div>

      {/* Header with profile info and actions */}
      <DashboardHeader
        title={vendor.businessName}
        description={vendor.description || "Registered marketplace merchant store."}
        badge={<StatusBadge status={vendor.status || "pending"} />}
      >
        <VendorStatusActions
          vendorId={vendor._id}
          vendorName={vendor.businessName}
          currentStatus={vendor.status || "pending"}
        />
      </DashboardHeader>

      {/* Store overview and KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="md:col-span-1 rounded-xl border border-slate-200 bg-white p-5 flex flex-col items-center text-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={vendor.businessName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                <Store className="h-10 w-10" />
              </div>
            )}
          </div>
          <h3 className="mt-3 font-semibold text-slate-900">{vendor.businessName}</h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <Mail className="h-3.5 w-3.5" />
            <span className="truncate max-w-[180px]">{vendor.email}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              Member since{" "}
              {vendor.createdAt
                ? new Date(vendor.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>

          {vendor.slug?.current && (
            <Link
              href={`/vendor/${vendor.slug.current}`}
              target="_blank"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-shop-dark-green hover:underline"
            >
              Public Storefront <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>

        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatsCard
            title="Catalog Size"
            value={productCount}
            icon={Package}
            color="green"
            description="Active listed products"
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
            value={
              vendor.status
                ? vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)
                : "Pending"
            }
            icon={Store}
            color={
              vendor.status === "approved"
                ? "green"
                : vendor.status === "suspended"
                ? "rose"
                : "amber"
            }
            description="Account clearance level"
          />
        </div>
      </div>

      {/* Products belonging to this vendor */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Vendor Products ({products.length})
            </h3>
            <p className="text-xs text-slate-500">
              Catalog items managed and sold under this merchant account
            </p>
          </div>
          <Link
            href={`/admin/products/new`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-shop-dark-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-shop-light-green transition"
          >
            Add Product for Vendor
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            This vendor has not published any products yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {products.map((product: any) => {
              const pImg =
                product.image && product.image[0]
                  ? urlFor(product.image[0]).width(60).height(60).url()
                  : null;

              return (
                <div
                  key={product._id}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shrink-0">
                      {pImg ? (
                        <Image
                          src={pImg}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <Package className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-slate-900 text-sm block truncate max-w-md">
                        {product.title}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>₦{product.price?.toLocaleString()}</span>
                        <span>•</span>
                        <span>Stock: {product.stock}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={product.status || "available"} />
                    <Link
                      href={`/admin/products/${product._id}/edit`}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                      title="Edit Product"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </PermissionGuard>
  );
};

export default AdminVendorDetailPage;
