import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  PackagePlus,
  ShieldCheck,
  Store,
} from "lucide-react";

import { getAdminVendors } from "@/sanity/queries/adminQueries";
import {
  createAdminProduct,
  type AdminProductInput,
} from "@/actions/adminProductActions";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AdminProductForm from "@/components/dashboard/AdminProductForm";

const AdminNewProductPage = async () => {
  const vendors = await getAdminVendors({ status: "approved" });

  const handleCreateProduct = async (data: AdminProductInput) => {
    "use server";
    await createAdminProduct(data);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-12 sm:space-y-7">
      {/* Back navigation */}
      <Link
        href="/admin/products"
        className="group inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-500 transition-colors hover:text-shop-dark-green"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-xs transition-all group-hover:border-emerald-200 group-hover:bg-emerald-50">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        </span>
        Back to Products
      </Link>

      {/* Page heading */}
      <DashboardHeader
        title="Add New Product"
        description="Create a marketplace listing and assign it to an approved vendor."
      />

      {/* Page introduction */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-shop-dark-green to-[#0A5136] p-5 text-white shadow-sm sm:p-7">
        {/* Decorative background element */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full border-[24px] border-white/[0.04]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 right-28 h-40 w-40 rounded-full bg-white/[0.035] blur-2xl"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
              <PackagePlus className="h-5 w-5 text-white" />
            </div>

            <div className="max-w-xl">
              <p className="text-sm font-semibold text-white sm:text-base">
                Build your marketplace catalog
              </p>
              <p className="mt-1.5 text-xs leading-6 text-emerald-50/80 sm:text-sm">
                Add accurate product information, pricing, images, and stock
                details to create a clear shopping experience for customers.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 sm:self-center">
            <ShieldCheck className="h-4 w-4 text-emerald-200" />
            <span className="text-xs font-semibold text-white">
              Admin product creation
            </span>
          </div>
        </div>
      </div>

      {/* Vendor availability */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-shop-darkOrange">
            <Store className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Approved vendor accounts
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Product listings can be attributed to vendors whose accounts
              have been approved.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start rounded-lg bg-emerald-50 px-3 py-2 sm:self-center">
          <span className="h-2 w-2 rounded-full bg-emerald-600" />
          <span className="text-sm font-bold text-shop-dark-green">
            {vendors.length}
          </span>
          <span className="text-xs font-medium text-emerald-800">
            {vendors.length === 1 ? "vendor available" : "vendors available"}
          </span>
        </div>
      </div>

      {/* Product form */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="border-b border-slate-100 px-4 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-shop-dark-green">
              <PackagePlus className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Product information
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Complete the product details below to create a listing.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-7">
          <AdminProductForm
            vendors={vendors}
            onSubmit={handleCreateProduct}
            submitLabel="Publish Product"
          />
        </div>
      </section>
    </div>
  );
};

export default AdminNewProductPage;