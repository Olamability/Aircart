
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Store,
  Users,
  ShieldCheck,
  Clock,
  Ban,
  Package,
  ArrowUpRight,
  Building2,
} from "lucide-react";

import { getAdminVendors } from "@/sanity/queries/adminQueries";
import { urlFor } from "@/sanity/lib/image";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FilterBar from "@/components/dashboard/FilterBar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import VendorStatusActions from "@/components/dashboard/VendorStatusActions";
import { PermissionGuard } from "@/lib/permissionGuard";
import { permissions } from "@/lib/permissions";

interface AdminVendorsPageProps {
  searchParams: Promise<{
    query?: string;
    status?: string;
  }>;
}

const AdminVendorsPage = async ({
  searchParams,
}: AdminVendorsPageProps) => {
  const sp = await searchParams;

  const vendors = await getAdminVendors({
    query: sp.query,
    status: sp.status,
  });

  const filters = [
    {
      key: "status",
      label: "Vendor Status",
      options: [
        { label: "Approved", value: "approved" },
        { label: "Pending", value: "pending" },
        { label: "Suspended", value: "suspended" },
      ],
    },
  ];

  const approvedCount = vendors.filter(
    (vendor: any) => vendor.status === "approved"
  ).length;

  const pendingCount = vendors.filter(
    (vendor: any) => vendor.status === "pending"
  ).length;

  const suspendedCount = vendors.filter(
    (vendor: any) => vendor.status === "suspended"
  ).length;

  const totalProducts = vendors.reduce(
    (total: number, vendor: any) =>
      total + (Number(vendor.productCount) || 0),
    0
  );

  const stats = [
    {
      label: "Total Vendors",
      value: vendors.length,
      description: "Matching current filters",
      icon: Store,
      color: "green",
    },
    {
      label: "Approved Vendors",
      value: approvedCount,
      description: "Eligible marketplace sellers",
      icon: ShieldCheck,
      color: "blue",
    },
    {
      label: "Pending Review",
      value: pendingCount,
      description: "Awaiting verification",
      icon: Clock,
      color: "amber",
    },
    {
      label: "Suspended",
      value: suspendedCount,
      description: "Currently restricted",
      icon: Ban,
      color: "rose",
    },
  ];

  return (
    <PermissionGuard permission={permissions.vendors_view}>
      <div className="space-y-7 pb-12">
        <DashboardHeader
          title="Vendor Management"
          description="Manage marketplace sellers, review vendor status, and monitor merchant activity across Airmart."
        />

        {/* Overview */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            const colorStyles = {
              green: {
                icon: "bg-emerald-50 text-emerald-700",
                accent: "bg-emerald-500",
              },
              blue: {
                icon: "bg-sky-50 text-sky-700",
                accent: "bg-sky-500",
              },
              amber: {
                icon: "bg-amber-50 text-amber-700",
                accent: "bg-amber-500",
              },
              rose: {
                icon: "bg-rose-50 text-rose-700",
                accent: "bg-rose-500",
              },
            };

            const styles =
              colorStyles[stat.color as keyof typeof colorStyles];

            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 ${styles.accent} opacity-0 transition-opacity group-hover:opacity-100`}
                />

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>

                    <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                      {stat.value.toLocaleString()}
                    </h3>

                    <p className="mt-2 text-xs text-slate-400">
                      {stat.description}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Vendor activity summary */}
        <section className="overflow-hidden rounded-2xl bg-shop-dark-green shadow-sm">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                <Building2 className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white">
                  Marketplace Vendor Network
                </h3>

                <p className="mt-1 max-w-xl text-sm leading-6 text-emerald-100/80">
                  Keep track of merchant activity and the products represented
                  across your marketplace.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3">
              <Package className="h-5 w-5 text-emerald-200" />

              <div>
                <p className="text-xl font-bold text-white">
                  {totalProducts.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-100/80">
                  Products represented
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Search and filters */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900">
              Find Vendors
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Search by business name or email, or narrow results by status.
            </p>
          </div>

          <FilterBar
            searchPlaceholder="Search vendor by business name or email..."
            filters={filters}
          />
        </section>

        {/* Vendor listing */}
        {vendors.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <EmptyState
              icon={Store}
              title="No vendors found"
              description="No merchants matched your active search or status filter. Try adjusting your search criteria."
            />
          </div>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Marketplace Vendors
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {vendors.length.toLocaleString()} vendor
                  {vendors.length === 1 ? "" : "s"} in the current results
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Vendor directory
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Vendor</th>
                    <th className="px-4 py-4">Email Address</th>
                    <th className="px-4 py-4">Products</th>
                    <th className="px-4 py-4">Date Joined</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {vendors.map((vendor: any) => {
                    const logoUrl =
                      vendor.logo && vendor.logo.asset
                        ? urlFor(vendor.logo)
                          .width(96)
                          .height(96)
                          .url()
                        : null;

                    return (
                      <tr
                        key={vendor._id}
                        className="transition-colors duration-200 hover:bg-slate-50/80"
                      >
                        <td className="px-6 py-4">
                          <div className="flex min-w-52 items-center gap-3">
                            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                              {logoUrl ? (
                                <Image
                                  src={logoUrl}
                                  alt={vendor.businessName || "Vendor logo"}
                                  fill
                                  sizes="44px"
                                  className="object-cover"
                                />
                              ) : (
                                <Store className="h-5 w-5 text-slate-400" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <Link
                                href={`/admin/vendors/${vendor._id}`}
                                className="block max-w-52 truncate font-semibold text-slate-900 transition hover:text-shop-dark-green"
                              >
                                {vendor.businessName}
                              </Link>

                              <p className="mt-1 font-mono text-[10px] text-slate-400">
                                ID: {vendor._id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="max-w-56 truncate px-4 py-4 text-xs font-medium text-slate-600">
                          {vendor.email || "—"}
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                            <Package className="h-3.5 w-3.5 text-slate-400" />
                            {vendor.productCount ?? 0}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                          {vendor.createdAt
                            ? new Date(
                              vendor.createdAt
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                            : "—"}
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge
                            status={vendor.status || "pending"}
                          />
                        </td>

                        <td className="px-6 py-4 text-right">
                          <VendorStatusActions
                            vendorId={vendor._id}
                            vendorName={vendor.businessName}
                            currentStatus={vendor.status || "pending"}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {vendors.map((vendor: any) => {
                const logoUrl =
                  vendor.logo && vendor.logo.asset
                    ? urlFor(vendor.logo).width(96).height(96).url()
                    : null;

                return (
                  <article
                    key={vendor._id}
                    className="space-y-4 p-4 transition-colors hover:bg-slate-50/70 sm:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        {logoUrl ? (
                          <Image
                            src={logoUrl}
                            alt={vendor.businessName || "Vendor logo"}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <Store className="h-5 w-5 text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/admin/vendors/${vendor._id}`}
                          className="block truncate text-sm font-semibold text-slate-900 hover:text-shop-dark-green"
                        >
                          {vendor.businessName}
                        </Link>

                        <p className="mt-1 break-all text-xs text-slate-500">
                          {vendor.email || "No email available"}
                        </p>

                        <p className="mt-1 font-mono text-[10px] text-slate-400">
                          ID: {vendor._id.slice(0, 8)}...
                        </p>
                      </div>

                      <StatusBadge
                        status={vendor.status || "pending"}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                      <div>
                        <p className="text-[11px] font-medium text-slate-400">
                          Products
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                          <Package className="h-4 w-4 text-slate-400" />
                          {vendor.productCount ?? 0}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-medium text-slate-400">
                          Date joined
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {vendor.createdAt
                            ? new Date(
                              vendor.createdAt
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                            : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <Link
                        href={`/admin/vendors/${vendor._id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-shop-dark-green transition hover:text-shop-light-green"
                      >
                        View vendor
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>

                      <VendorStatusActions
                        vendorId={vendor._id}
                        vendorName={vendor.businessName}
                        currentStatus={vendor.status || "pending"}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </PermissionGuard>
  );
};

export default AdminVendorsPage;
