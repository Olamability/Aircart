import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Store, ShieldCheck, Clock, Ban } from "lucide-react";
import { getAdminVendors } from "@/sanity/queries/adminQueries";
import { urlFor } from "@/sanity/lib/image";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FilterBar from "@/components/dashboard/FilterBar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import VendorStatusActions from "@/components/dashboard/VendorStatusActions";

interface AdminVendorsPageProps {
  searchParams: Promise<{
    query?: string;
    status?: string;
  }>;
}

const AdminVendorsPage = async ({ searchParams }: AdminVendorsPageProps) => {
  const sp = await searchParams;
  const vendors = await getAdminVendors({
    query: sp.query,
    status: sp.status,
  });

  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Approved", value: "approved" },
        { label: "Pending", value: "pending" },
        { label: "Suspended", value: "suspended" },
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <DashboardHeader
        title="Vendors Management"
        description="Verify seller documentation, track merchant catalog sizes, and oversee platform merchant status."
      />

      <FilterBar searchPlaceholder="Search vendor by business name or email..." filters={filters} />

      {vendors.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No vendors found"
          description="No merchants matched your active search or status filter."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Vendor</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Products</th>
                  <th className="px-4 py-3.5">Joined</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.map((vendor: any) => {
                  const logoUrl =
                    vendor.logo && vendor.logo.asset
                      ? urlFor(vendor.logo).width(64).height(64).url()
                      : null;

                  return (
                    <tr key={vendor._id} className="hover:bg-slate-50/75 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 relative">
                            {logoUrl ? (
                              <Image
                                src={logoUrl}
                                alt={vendor.businessName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400">
                                <Store className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/vendors/${vendor._id}`}
                              className="font-medium text-slate-900 hover:text-shop-dark-green hover:underline"
                            >
                              {vendor.businessName}
                            </Link>
                            <p className="text-xs text-slate-400 font-mono">
                              ID: {vendor._id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-xs font-medium text-slate-700">
                        {vendor.email}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                          {vendor.productCount} product{vendor.productCount === 1 ? "" : "s"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-500">
                        {vendor.createdAt
                          ? new Date(vendor.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={vendor.status || "pending"} />
                      </td>

                      <td className="px-5 py-4 text-right">
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

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {vendors.map((vendor: any) => (
              <div key={vendor._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">{vendor.businessName}</h4>
                    <p className="text-xs text-slate-500">{vendor.email}</p>
                  </div>
                  <StatusBadge status={vendor.status || "pending"} />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Products: {vendor.productCount}</span>
                  <span>
                    Joined:{" "}
                    {vendor.createdAt
                      ? new Date(vendor.createdAt).toLocaleDateString()
                      : "—"}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-2 flex justify-end">
                  <VendorStatusActions
                    vendorId={vendor._id}
                    vendorName={vendor.businessName}
                    currentStatus={vendor.status || "pending"}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendorsPage;
