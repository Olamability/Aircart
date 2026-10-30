import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Package,
  PencilLine,
  ShieldCheck,
  Store,
} from "lucide-react";

import { client } from "@/sanity/lib/client";
import { getAdminVendors } from "@/sanity/queries/adminQueries";

import {
  updateAdminProduct,
  type AdminProductInput,
} from "@/actions/adminProductActions";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AdminProductForm from "@/components/dashboard/AdminProductForm";

interface AdminProductEditPageProps {
  params: Promise<{ productId: string }>;
}

const AdminProductEditPage = async ({
  params,
}: AdminProductEditPageProps) => {
  const { productId } = await params;

  const [product, vendors] = await Promise.all([
    client.fetch(
      `*[_type == "product" && _id == $productId][0]{
        _id,
        title,
        description,
        price,
        discount,
        stock,
        status,
        isNew,
        variant,
        isfeatured,
        image,
        "vendorId": vendor._ref,
        "brandId": brand._ref,
        "categoryIds": categories[]._ref
      }`,
      { productId }
    ),
    getAdminVendors(),
  ]);

  if (!product) {
    notFound();
  }

  const handleUpdate = async (data: AdminProductInput) => {
    "use server";
    await updateAdminProduct(productId, data);
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
        title="Edit Product"
        description="Manage product information, pricing, inventory, and marketplace visibility."
      />

      {/* Editing banner */}
      <section className="relative overflow-hidden rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-shop-dark-green to-[#0A5136] p-5 text-white shadow-sm sm:p-7">
        {/* Decorative elements */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full border-[24px] border-white/[0.04]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 right-28 h-40 w-40 rounded-full bg-white/[0.035] blur-2xl"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
              <PencilLine className="h-5 w-5 text-white" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200">
                  Editing marketplace listing
                </span>

                <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-50">
                  Existing product
                </span>
              </div>

              <h2 className="mt-2 break-words text-xl font-bold tracking-tight text-white sm:text-2xl">
                {product.title}
              </h2>

              <p className="mt-1.5 max-w-xl text-xs leading-6 text-emerald-50/80 sm:text-sm">
                Make the necessary changes below. Your existing product
                information will be loaded into the form for editing.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 sm:self-center">
            <ShieldCheck className="h-4 w-4 text-emerald-200" />
            <span className="text-xs font-semibold text-white">
              Product management
            </span>
          </div>
        </div>
      </section>

      {/* Product context */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-shop-dark-green">
            <Package className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">
              Product being updated
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900">
              {product.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-shop-darkOrange">
            <Store className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">
              Vendor accounts
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {vendors.length}{" "}
              {vendors.length === 1
                ? "vendor available"
                : "vendors available"}
            </p>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="border-b border-slate-100 px-4 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-shop-dark-green">
              <PencilLine className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Update product information
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Review and modify the existing product details below.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-7">
          <AdminProductForm
            initialData={product}
            vendors={vendors}
            onSubmit={handleUpdate}
            submitLabel="Update Product"
          />
        </div>
      </section>
    </div>
  );
};

export default AdminProductEditPage;