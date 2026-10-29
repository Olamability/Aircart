import Link from "next/link";
import { Package, Clock, AlertTriangle } from "lucide-react";
import VendorProductForm from "@/components/VendorProductForm";
import { createVendorProduct } from "@/actions/createVendorProduct";
import type { VendorProductInput } from "@/lib/validators/product";
import { getCurrentVendor } from "@/lib/vendor";
import VendorMissingProfileState from "@/components/dashboard/VendorMissingProfileState";
import EmptyState from "@/components/dashboard/EmptyState";

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

  if (vendor.status === "pending") {
    return (
      <EmptyState
        icon={Clock}
        title="Product creation locked"
        description="You cannot create new products while your merchant application is pending administrator approval."
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
        title="Product creation suspended"
        description="Product creation is disabled while your merchant account is suspended."
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

  const handleSubmit = async (data: VendorProductInput) => {
    "use server";
    await createVendorProduct(data);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-shop-dark-green">
        Add Product
      </h1>
      <p className="mt-2 text-lightColor">
        Create a new product for your store.
      </p>
      <VendorProductForm
        onSubmit={handleSubmit}
        submitButtonLabel="Create Product"
        successMessage="Product created successfully"
      />
    </div>
  );
};

export default NewVendorProductPage;

