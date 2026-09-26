import Image from "next/image";
import { notFound } from "next/navigation";
import { getVendorBySlug } from "@/sanity/queries";
import { urlFor } from "@/sanity/lib/image";
import Container from "@/components/Container";
import ProductCard from "@/components/ProductCard";
import NoProductAvailable from "@/components/NoProductAvailable";

const VendorStorefrontPage = async ({
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
      <div className="flex flex-col items-center text-center">
        <div className="h-28 w-28 overflow-hidden rounded-full border bg-white shadow-xs">
          {vendor.logo ? (
            <Image
              src={urlFor(vendor.logo).url()}
              alt={vendor.businessName}
              width={112}
              height={112}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-shop-light-bg text-2xl font-bold text-shop-dark-green">
              {vendor.businessName.charAt(0)}
            </div>
          )}
        </div>
        <h1 className="mt-4 text-2xl font-bold text-shop-dark-green">
          {vendor.businessName}
        </h1>
        {vendor.description && (
          <p className="mt-2 max-w-2xl text-sm text-shop-light-text">
            {vendor.description}
          </p>
        )}
        {vendor.status && (
          <p className="mt-3 text-xs font-semibold capitalize text-shop-light-green">
            {vendor.status}
          </p>
        )}
      </div>

      <div className="mt-10 sm:mt-12">
        <div className="mb-6 flex items-center justify-between border-b border-slate-200/80 pb-4">
          <h2 className="text-lg sm:text-xl font-bold text-shop-dark-green">
            Products from {vendor.businessName}
          </h2>
          {vendor.products && vendor.products.length > 0 && (
            <span className="text-xs sm:text-sm font-medium text-slate-500">
              {vendor.products.length} {vendor.products.length === 1 ? "product" : "products"}
            </span>
          )}
        </div>

        {vendor.products && vendor.products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
            {vendor.products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <NoProductAvailable selectedTab="vendor catalog" />
        )}
      </div>
    </Container>
  );
};

export default VendorStorefrontPage;
