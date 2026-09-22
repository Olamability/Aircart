import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { client } from "@/sanity/lib/client";
import { getAdminVendors } from "@/sanity/queries/adminQueries";
import { updateAdminProduct } from "@/actions/adminProductActions";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AdminProductForm from "@/components/dashboard/AdminProductForm";

interface AdminProductEditPageProps {
  params: Promise<{ productId: string }>;
}

const AdminProductEditPage = async ({ params }: AdminProductEditPageProps) => {
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

  const handleUpdate = async (data: any) => {
    "use server";
    await updateAdminProduct(productId, data);
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
        title={`Edit "${product.title}"`}
        description="Update pricing, vendor assignment, stock availability, or marketing tags."
      />

      <AdminProductForm
        initialData={product}
        vendors={vendors}
        onSubmit={handleUpdate}
        submitLabel="Update Product"
      />
    </div>
  );
};

export default AdminProductEditPage;
