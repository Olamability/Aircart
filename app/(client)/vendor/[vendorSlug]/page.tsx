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

  // Preserve vendor approval enforcement.
  if (!vendor || vendor.status !== "approved") {
    notFound();
  }

  const productCount = vendor.products?.length ?? 0;

  return (
    <Container className="py-6 sm:py-9 lg:py-12">
      {/* Store identity */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        {/* Subtle branded background */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-36 bg-gradient-to-br from-shop-light-bg via-white to-emerald-50/70 sm:h-44"
        />

        <div
          aria-hidden="true"
          className="absolute -right-16 -top-24 -z-10 h-64 w-64 rounded-full border border-shop-dark-green/5 sm:-right-8"
        />

        <div
          aria-hidden="true"
          className="absolute -right-6 -top-14 -z-10 h-44 w-44 rounded-full border border-shop-dark-green/5"
        />

        <div className="relative flex flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:gap-7 sm:px-8 sm:py-9 lg:px-10">

          {/* Vendor logo */}
          <div className="relative mx-auto shrink-0 rounded-2xl bg-white p-1.5 shadow-md shadow-slate-900/[0.05] ring-1 ring-slate-200/80 sm:mx-0">
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-shop-light-bg sm:h-28 sm:w-28">
              {vendor.logo ? (
                <Image
                  src={urlFor(vendor.logo).url()}
                  alt={`${vendor.businessName} logo`}
                  width={112}
                  height={112}
                  className="h-full w-full object-cover"
                  priority
                />
              ) : (
                <span className="text-4xl font-bold text-shop-dark-green sm:text-5xl">
                  {vendor.businessName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Vendor information */}
          <div className="min-w-0 flex-1 text-center sm:text-left">

            {/* Business name and verification */}
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-shop-dark-green sm:text-3xl">
                {vendor.businessName}
              </h1>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                Verified Store
              </span>
            </div>

            {/* Description */}
            {vendor.description && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-shop-light-text sm:text-[15px]">
                {vendor.description}
              </p>
            )}

            {/* Store details */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-start">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                <span className="h-2 w-2 rounded-full bg-shop-dark-green" />
                {productCount} {productCount === 1 ? "product" : "products"}
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

              <span className="text-xs font-medium text-shop-light-green">
                Spaazr Marketplace
              </span>
            </div>
          </div>

          {/* Desktop store status */}
          <div className="hidden shrink-0 lg:flex lg:items-center">
            <span className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-shop-dark-green shadow-sm">
              Shop with confidence
            </span>
          </div>
        </div>

        {/* Branded bottom accent */}
        <div
          aria-hidden="true"
          className="h-1 w-full bg-gradient-to-r from-shop-dark-green via-emerald-600 to-shop-darkOrange"
        />
      </section>

      {/* Store catalog */}
      <section className="mt-9 sm:mt-12 lg:mt-14">
        <div className="mb-6 flex flex-col gap-3 border-b border-slate-200/80 pb-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-shop-darkOrange">
              Explore the collection
            </p>

            <h2 className="text-xl font-bold tracking-tight text-shop-dark-green sm:text-2xl">
              Shop {vendor.businessName}
            </h2>

            <p className="mt-1.5 text-sm leading-6 text-shop-light-text">
              Discover products available from this store.
            </p>
          </div>

          {productCount > 0 && (
            <span className="inline-flex w-fit shrink-0 items-center rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-600 sm:text-sm">
              {productCount}{" "}
              {productCount === 1 ? "item" : "items"} available
            </span>
          )}
        </div>

        {productCount > 0 ? (
          <div className="grid grid-cols-2 gap-3.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5 xl:gap-6">
            {vendor.products!.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 px-3 py-8 sm:px-6 sm:py-12">
            <NoProductAvailable selectedTab="vendor catalog" />
          </div>
        )}
      </section>
    </Container>
  );
};

export default VendorStorefrontPage;
