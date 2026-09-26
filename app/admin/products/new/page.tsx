import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminVendors } from "@/sanity/queries/adminQueries";
import { createAdminProduct, type AdminProductInput } from "@/actions/adminProductActions";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AdminProductForm from "@/components/dashboard/AdminProductForm";

const AdminNewProductPage = async () => {
  const vendors = await getAdminVendors({ status: "approved" });

  const handleCreateProduct = async (data: AdminProductInput) => {
    "use server";
    await createAdminProduct(data);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="mb-2">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Products
        </Link>
      </div>

      <DashboardHeader
        title="Add New Marketplace Product"
        description="Create and list a product with vendor attribution, category taxonomy, and stock rules."
      />

      <AdminProductForm
        vendors={vendors}
        onSubmit={handleCreateProduct}
        submitLabel="Publish Product"
      />
    </div>
  );
};

export default AdminNewProductPage;
