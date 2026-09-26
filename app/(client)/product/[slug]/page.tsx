import React from "react";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/sanity/queries";
import type { Product } from "@/sanity.types";
import PriceView from "@/components/PriceView";
import AddToCartButton from "@/components/AddToCartButton";
import FavoriteIcon from "@/components/FavoriteIcon";
import Container from "@/components/Container";
import ImageView from "@/components/ImageView";
import { StarIcon, RotateCcw, Flame, CheckCircle2, ChevronRight } from "lucide-react";
import ProductCharacteristics from "@/components/ProductCharacteristics";
import { FaRegQuestionCircle } from "react-icons/fa";
import { RxBorderSplit } from "react-icons/rx";
import { TbTruckDelivery } from "react-icons/tb";
import { FiShare2 } from "react-icons/fi";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import Link from "next/link";

const SingleProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const isOutOfStock = (product?.stock as number) <= 0;
  const hasDiscount = !!product?.discount && product.discount > 0;
  const status = product?.status;
  const firstCategory = product?.categories?.[0];

  return (
    <div className="bg-white min-h-screen py-6 sm:py-8 lg:py-12">
      <Container>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs sm:text-sm text-slate-500 overflow-x-auto whitespace-nowrap pb-1">
          <Link href="/" className="hover:text-shop-dark-green transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link href="/shop" className="hover:text-shop-dark-green transition-colors">
            Shop
          </Link>
          {firstCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {firstCategory.slug?.current ? (
                <Link
                  href={`/category/${firstCategory.slug.current}`}
                  className="hover:text-shop-dark-green transition-colors"
                >
                  {firstCategory.title}
                </Link>
              ) : (
                <span>{firstCategory.title}</span>
              )}
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-900 font-medium truncate max-w-[200px] sm:max-w-xs">
            {product?.title}
          </span>
        </nav>

        {/* 2-Column Product Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Image Stage */}
          <div className="lg:col-span-6 xl:col-span-6 lg:sticky lg:top-24">
            <ImageView images={product.image} isStock={product.stock} />
          </div>

          {/* Right Column: Information & Purchase Controls */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-6">
            {/* Badges & Identity */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Category tags */}
                {product?.categories && product.categories.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {product.categories.map((category) => (
                      <span
                        key={category._id || category.title}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 uppercase tracking-wider"
                      >
                        {category.title}
                      </span>
                    ))}
                  </div>
                )}

                {/* Status Badges */}
                {status === "sale" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-shop-dark-green text-white shadow-2xs">
                    Sale
                  </span>
                )}
                {status === "hot" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-2xs">
                    <Flame className="w-3 h-3 fill-white" />
                    Hot Deal
                  </span>
                )}
                {status === "new" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500 text-white shadow-2xs">
                    New Arrival
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {product?.title}
              </h1>

              {/* Rating & Social Proof */}
              <div className="flex items-center gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, index) => (
                    <StarIcon
                      key={index}
                      size={14}
                      className="text-amber-400"
                      fill="#f59e0b"
                    />
                  ))}
                </div>
                <span className="font-semibold text-slate-700">4.9</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 underline decoration-slate-300 underline-offset-2">
                  120 verified reviews
                </span>
              </div>
            </div>

            {/* Vendor / "Sold by" Section */}
            {product?.vendor && (
              <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 overflow-hidden rounded-full border border-slate-200 bg-white shrink-0 shadow-2xs">
                    {product.vendor.logo ? (
                      <Image
                        src={urlFor(product.vendor.logo).width(100).height(100).url()}
                        alt={product.vendor.businessName}
                        width={44}
                        height={44}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-shop-dark-green bg-emerald-50">
                        {product.vendor.businessName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">Sold by</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    {product.vendor.slug?.current ? (
                      <Link
                        href={`/vendor/${product.vendor.slug.current}`}
                        className="font-semibold text-sm text-slate-900 hover:text-shop-dark-green transition-colors"
                      >
                        {product.vendor.businessName}
                      </Link>
                    ) : (
                      <p className="font-semibold text-sm text-slate-900">
                        {product.vendor.businessName}
                      </p>
                    )}
                  </div>
                </div>

                {product.vendor.slug?.current && (
                  <Link
                    href={`/vendor/${product.vendor.slug.current}`}
                    className="text-xs font-semibold text-shop-dark-green hover:underline decoration-1 underline-offset-2 shrink-0"
                  >
                    View store →
                  </Link>
                )}
              </div>
            )}

            {/* Pricing & Stock Card */}
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <PriceView
                    price={product?.price}
                    discount={product?.discount}
                    priceClassName="text-3xl sm:text-4xl font-black text-shop-dark-green tracking-tight"
                    discountClassName="text-lg text-slate-400 line-through"
                  />
                  {hasDiscount && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                      Save {product.discount}%
                    </span>
                  )}
                </div>

                {/* Stock status badge */}
                <div>
                  {!isOutOfStock ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      In Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Variant indicator if available */}
              {product?.variant && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 text-xs">
                  <span className="text-slate-500 font-medium">Edition / Variant:</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-800 capitalize">
                    {product.variant}
                  </span>
                </div>
              )}

              {/* Primary Call to Action & Wishlist */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex-1">
                  <AddToCartButton
                    product={product as unknown as Product}
                    className="w-full h-12 rounded-xl text-sm font-semibold shadow-xs hover:shadow-sm"
                  />
                </div>

                <div className="shrink-0">
                  <FavoriteIcon
                    product={product as unknown as Product}
                    className="static"
                    buttonClassName="w-12 h-12 rounded-xl border border-slate-200/90 bg-white hover:border-rose-200 hover:bg-rose-50/50 shadow-2xs flex items-center justify-center transition-all cursor-pointer"
                    iconSize={18}
                  />
                </div>
              </div>
            </div>

            {/* Description Section */}
            {product?.description && (
              <div className="space-y-2">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Product Overview
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-slate-600">
                  {product.description}
                </p>
              </div>
            )}

            {/* Specifications Accordion */}
            <ProductCharacteristics product={product as unknown as Product} />

            {/* Trust & Delivery Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 space-y-3.5 shadow-2xs">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-shop-dark-green flex items-center justify-center shrink-0">
                  <TbTruckDelivery className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Free Express Delivery
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fast courier delivery nationwide. Enter your postal code during checkout for exact delivery timeframe.
                  </p>
                </div>
              </div>

              <div className="h-px bg-slate-200/60" />

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-shop-dark-green flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    30-Day Hassle-Free Returns
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Shop with total peace of mind with Airmart buyer protection and simple returns on eligible items.
                  </p>
                </div>
              </div>
            </div>

            {/* Auxiliary Actions Strip */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <RxBorderSplit className="text-sm text-slate-400" />
                <span>Compare color</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <FaRegQuestionCircle className="text-sm text-slate-400" />
                <span>Ask a question</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <TbTruckDelivery className="text-sm text-slate-400" />
                <span>Delivery & Return</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <FiShare2 className="text-sm text-slate-400" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SingleProductPage;
