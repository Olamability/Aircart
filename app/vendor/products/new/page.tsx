import VendorCreateProductForm from "@/components/VendorCreateProductForm";
import { createVendorProduct } from "@/actions/createVendorProduct";
const NewVendorProductPage = () => {
  const handleSubmit = async (data: {
    title: string;
    description?: string;
    price: number;
    discount?: number;
    stock: number;
    status?: "new" | "hot" | "sale" | "available";
    isNew?: boolean;
    variant?:
      "gadget" | "appliances" | "refrigerator" | "others" | "food & beverages";
    isfeatured?: boolean;
    brandId?: string;
    categoryIds: string[];
  }) => {
    "use server";
    await createVendorProduct(data);
  };
  return (
    <div>
      {" "}
      <h1 className="text-2xl font-bold text-shop-dark-green">
        {" "}
        Add Product{" "}
      </h1>{" "}
      <p className="mt-2 text-lightColor">
        {" "}
        Create a new product for your store.{" "}
      </p>{" "}
      <VendorCreateProductForm onSubmit={handleSubmit} />{" "}
    </div>
  );
};
export default NewVendorProductPage;
