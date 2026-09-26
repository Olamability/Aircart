import VendorProductForm from "@/components/VendorProductForm";
import { createVendorProduct } from "@/actions/createVendorProduct";
import type { VendorProductInput } from "@/lib/validators/product";

const NewVendorProductPage = () => {
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

