import Image from "next/image";
import { notFound } from "next/navigation";
import { getVendorBySlug } from "@/sanity/queries";
import { urlFor } from "@/sanity/lib/image";
import Container from "@/components/Container";
import ProductCard from "@/components/ProductCard";
const VendorPage = async ({
  params,
}: {
  params: Promise<{ vendorSlug: string }>;
}) => {
  const { vendorSlug } = await params;
  const vendor = await getVendorBySlug(vendorSlug);
  if (!vendor) {
    notFound();
  }
  return (
    <Container className="py-10">
      {" "}
      <div className="flex flex-col items-center text-center">
        {" "}
        <div className="h-28 w-28 overflow-hidden rounded-full border bg-white">
          {" "}
          {vendor.logo ? (
            <Image
              src={urlFor(vendor.logo).width(200).height(200).url()}
              alt={vendor.businessName}
              width={200}
              height={200}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-shop-dark-green">
              {" "}
              {vendor.businessName.charAt(0)}{" "}
            </div>
          )}{" "}
        </div>{" "}
        <h1 className="mt-4 text-2xl font-bold text-shop-dark-green">
          {" "}
          {vendor.businessName}{" "}
        </h1>{" "}
        {vendor.description && (
          <p className="mt-2 max-w-2xl text-sm text-shop-light-text">
            {" "}
            {vendor.description}{" "}
          </p>
        )}{" "}
        {vendor.status && (
          <p className="mt-3 text-xs font-semibold capitalize text-shop-light-green">
            {" "}
            {vendor.status}{" "}
          </p>
        )}{" "}
      </div>{" "}
      {vendor.products && vendor.products.length > 0 && (
        <div className="mt-10">
          {" "}
          <h2 className="mb-5 text-xl font-bold text-shop-dark-green">
            {" "}
            Products from {vendor.businessName}{" "}
          </h2>{" "}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {" "}
            {vendor.products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}{" "}
          </div>{" "}
        </div>
      )}{" "}
    </Container>
  );
};
export default VendorPage;
