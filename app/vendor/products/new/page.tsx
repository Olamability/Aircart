
import Link from "next/link";
import {
  Package,
  Clock,
  AlertTriangle,
  ArrowLeft,
  PlusCircle,
  ShieldCheck,
  Store,
  CheckCircle2,
} from "lucide-react";

import VendorProductForm from "@/components/VendorProductForm";
import { createVendorProduct } from "@/actions/createVendorProduct";
import type { VendorProductInput } from "@/lib/validators/product";
import { getCurrentVendor } from "@/lib/vendor";
import VendorMissingProfileState from "@/components/dashboard/VendorMissingProfileState";
import EmptyState from "@/components/dashboard/EmptyState";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";

const NewVendorProductPage = async () => {
  const vendor = await getCurrentVendor();

  if (!vendor) {
    return (
      <VendorMissingProfileState
        icon={Package}
        title="Merchant profile required"
        description="Your merchant profile has not been configured yet. Set up your store profile to begin listing products."
      />
    );
  }

  // Pending vendors cannot create products.
  if (vendor.status === "pending") {
    return (
      <div className="space-y-5 pb-8">
        <DashboardHeader
          title="Add Product"
          description="Create a new product for your marketplace store."
          badge={<StatusBadge status="pending" />}
        />

        <EmptyState
          icon={Clock}
          title="Product creation locked"
          description="You cannot create new products while your merchant application is pending administrator approval."
          action={
            <Link
              href="/vendor/products"
              className="inline-flex items-center gap-2 rounded-xl bg-shop-dark-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-shop-light-green hover:shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>
          }
        />
      </div>
    );
  }

  // Suspended vendors cannot create products.
  if (vendor.status === "suspended") {
    return (
      <div className="space-y-5 pb-8">
        <DashboardHeader
          title="Add Product"
          description="Create a new product for your marketplace store."
          badge={<StatusBadge status="suspended" />}
        />

        <EmptyState
          icon={AlertTriangle}
          title="Product creation suspended"
          description="Product creation is disabled while your merchant account is suspended. Please contact the administration team if you need assistance."
          action={
            <Link
              href="/vendor/products"
              className="inline-flex items-center gap-2 rounded-xl bg-shop-dark-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-shop-light-green hover:shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>
          }
        />
      </div>
    );
  }

  const handleSubmit = async (data: VendorProductInput) => {
    "use server";
    await createVendorProduct(data);
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-5 pb-8">
      {/* Back navigation */}
      <Link
        href="/vendor/products"
        className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-shop-dark-green"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white transition-all group-hover:border-shop-dark-green/20 group-hover:bg-shop-dark-green/5">
          <ArrowLeft className="h-4 w-4" />
        </span>
        Back to Products
      </Link>

      {/* Page heading */}
      <DashboardHeader
        title="Add Product"
        description="Create a new product and make it available in your marketplace store."
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Store Approved
        </div>
      </DashboardHeader>

      {/* Compact product introduction */}
      <section className="relative overflow-hidden rounded-2xl bg-shop-dark-green px-4 py-4 text-white shadow-sm sm:px-5 sm:py-5">
        <div className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full border-[22px] border-white/5" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-white/70">
              <PlusCircle className="h-3.5 w-3.5" />
              Product Management
            </div>

            <h2 className="mt-1.5 text-lg font-bold sm:text-xl">
              Grow your store catalog
            </h2>

            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-white/75 sm:text-sm">
              Add product details, pricing, images and stock information to
              make your products available to marketplace customers.
            </p>
          </div>

          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 sm:flex">
            <Package className="h-6 w-6 text-white" />
          </div>
        </div>
      </section>

      {/* Vendor context */}
      <section className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-shop-dark-green/10 text-shop-dark-green">
            <Store className="h-4.5 w-4.5" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Creating product for
            </p>

            <p className="truncate text-sm font-bold text-slate-800">
              {vendor.businessName || "Your Store"}
            </p>
          </div>
        </div>

        <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
          <ShieldCheck className="h-3.5 w-3.5" />
          Approved Merchant
        </div>
      </section>

      {/* Product form */}
      <section className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-shop-dark-green/10 text-shop-dark-green">
            <Package className="h-4.5 w-4.5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900">
              Product Information
            </h2>

            <p className="mt-0.5 text-[11px] text-slate-500">
              Complete the details below to create your product listing.
            </p>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-5 sm:py-5 lg:px-6">
          <VendorProductForm
            onSubmit={handleSubmit}
            submitButtonLabel="Submit"
            successMessage="Product created successfully"
          />
        </div>
      </section>

      {/* Compact listing reminder */}
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/70 bg-amber-50/60 px-3.5 py-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <ShieldCheck className="h-3.5 w-3.5" />
        </div>

        <div>
          <p className="text-[11px] font-semibold text-slate-800">
            Before submitting
          </p>

          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
            Check that your product description, images, pricing and available
            stock are accurate before submitting your listing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewVendorProductPage;
