import Link from "next/link";
import { getCurrentVendorProduct } from "@/lib/vendorProduct";
import { getCurrentVendor } from "@/lib/vendor";
import { notFound } from "next/navigation";
import VendorProductForm from "@/components/VendorProductForm";
import { updateVendorProduct } from "@/actions/updateVendorProduct";
import type { VendorProductInput } from "@/lib/validators/product";
import EmptyState from "@/components/dashboard/EmptyState";
import { Clock, AlertTriangle } from "lucide-react";

interface VendorProductEditPageProps {
  params: Promise<{ productId: string }>;
}
const VendorProductEditPage = async ({
  params,
}: VendorProductEditPageProps) => {
  const { productId } = await params;
  const vendor = await getCurrentVendor();
  if (!vendor) {
    notFound();
  }

  if (vendor.status === "pending") {
    return (
      <EmptyState
        icon={Clock}
        title="Product editing locked"
        description="You cannot update products while your merchant application is pending administrator approval."
        action={
          <Link
            href="/vendor/products"
            className="inline-flex items-center gap-2 rounded-lg bg-shop-dark-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-shop-light-green transition"
          >
            Back to Products
          </Link>
        }
      />
    );
  }

  if (vendor.status === "suspended") {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Product editing suspended"
        description="Product updates are disabled while your merchant account is suspended."
        action={
          <Link
            href="/vendor/products"
            className="inline-flex items-center gap-2 rounded-lg bg-shop-dark-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-shop-light-green transition"
          >
            Back to Products
          </Link>
        }
      />
    );
  }

  const product = await getCurrentVendorProduct(productId);
  if (!product) {
    notFound();
  }
  const handleSubmit = async (data: VendorProductInput) => {
    "use server";
    await updateVendorProduct(productId, data);
  };
  return (
    <div>
      {" "}
      <h1 className="text-2xl font-bold text-shop-dark-green">
        Edit Product
      </h1>{" "}
      <p className="mt-2 text-lightColor">
        {" "}
        Update your product information below.{" "}
      </p>{" "}
      <VendorProductForm product={product} onSubmit={handleSubmit} />{" "}
    </div>
  );
};
export default VendorProductEditPage;
