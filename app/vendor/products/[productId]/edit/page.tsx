import { getCurrentVendorProduct } from "@/lib/vendorProduct";
import { notFound } from "next/navigation";
import VendorProductForm from "@/components/VendorProductForm";
import { updateVendorProduct } from "@/actions/updateVendorProduct";
interface VendorProductEditPageProps {
  params: Promise<{ productId: string }>;
}
const VendorProductEditPage = async ({
  params,
}: VendorProductEditPageProps) => {
  const { productId } = await params;
  const product = await getCurrentVendorProduct(productId);
  if (!product) {
    notFound();
  }
  const handleSubmit = async (data: {
    title: string;
    description?: string;
    price: number;
    discount?: number;
    stock: number;
    status?: typeof product.status;
    isNew?: boolean;
    variant?: typeof product.variant;
    isfeatured?: boolean;
    imageAssetId?: string;
    categoryIds: string[];
  }) => {
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
