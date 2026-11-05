
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import { Flame, StarIcon, Package } from "lucide-react";
import PriceView from "./PriceView";
import AddToCartButton from "./AddToCartButton";
import FavoriteIcon from "./FavoriteIcon";

type ProductWithReviewSummary = Product & {
  averageRating?: number;
  reviewCount?: number;
};

interface ProductCardProps {
  product: ProductWithReviewSummary;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const isOutOfStock = (product.stock as number) <= 0;

  const averageRating =
    typeof product.averageRating === "number"
      ? product.averageRating
      : 0;

  const reviewCount =
    typeof product.reviewCount === "number"
      ? product.reviewCount
      : 0;

  const hasReviews = reviewCount > 0;

  // Format category string safely whether passed as array of strings or references.
  const categoryText = Array.isArray(product?.categories)
    ? product.categories
      .map((cat: unknown) =>
        typeof cat === "string"
          ? cat
          : typeof cat === "object" && cat && "title" in cat
            ? (cat as { title?: string }).title
            : "",
      )
      .filter(Boolean)
      .join(" • ")
    : "";

  return (
    <article className="group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#FDFBF7] shadow-[0_4px_8px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out hover:border-emerald-300 hover:shadow-[0_12px_24px_rgba(6,60,40,0.08)]">

      {/* 1. HERO IMAGE STAGE */}
      <div className="relative flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden bg-linear-to-b from-slate-50/90 via-slate-50/50 to-slate-100/60 p-3.5 sm:p-5">
        {product?.image?.[0] ? (
          <Link
            href={`/product/${product?.slug?.current}`}
            className="relative flex h-full w-full items-center justify-center"
            aria-label={
              product.title ? `View ${product.title}` : "View product"
            }
          >
            <Image
              src={urlFor(product.image[0]).url()}
              alt={product.title ?? "Product image"}
              loading="lazy"
              width={500}
              height={500}
              className={`h-full w-full object-contain object-center transition-transform duration-500 ease-out group-hover:scale-105 ${isOutOfStock ? "opacity-40 grayscale" : ""
                }`}
            />
          </Link>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 p-4 text-center text-slate-400">
            <Package className="h-8 w-8 stroke-1 text-slate-300" />
            <span className="text-xs font-medium">
              No image available
            </span>
          </div>
        )}

        {/* Status / Deal Badges */}
        <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex flex-col items-start gap-1">
          {product?.status === "hot" && (
            <Link
              href="/deal"
              className="group/deal pointer-events-auto inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-amber-800 shadow-2xs backdrop-blur-xs transition-all duration-200 hover:bg-amber-500 hover:text-white sm:text-[11px]"
            >
              <Flame className="h-3 w-3 fill-amber-500 text-amber-500 transition-colors group-hover/deal:fill-white group-hover/deal:text-white" />
              <span>Hot Deal</span>
            </Link>
          )}

          {product?.status === "new" && (
            <span className="rounded-full bg-shop-dark-green px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white shadow-2xs sm:text-[11px]">
              New Arrival
            </span>
          )}

          {product?.status === "available" && (
            <span className="rounded-full border border-slate-200/90 bg-white/95 px-2 py-0.5 text-[10px] font-medium tracking-wide text-slate-700 shadow-2xs backdrop-blur-xs">
              Available
            </span>
          )}

          {product?.status === "sale" && (
            <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white shadow-2xs sm:text-[11px]">
              Sale
            </span>
          )}

          {Boolean(product?.discount && product.discount > 0) && (
            <span className="rounded-full border border-rose-200/80 bg-rose-50 px-2 py-0.5 text-[10px] font-bold tracking-tight text-rose-700 shadow-2xs">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Favorite Wishlist Icon */}
        <FavoriteIcon
          product={product}
          className="right-2.5 top-2.5 z-10"
        />
      </div>

      {/* 2. PRODUCT DETAILS */}
      <div className="flex flex-1 flex-col gap-1.5 p-2 sm:gap-2 sm:p-3.5">
        <div className="flex flex-col gap-1">

          {/* Category */}
          <div className="flex min-h-4 items-center">
            {categoryText ? (
              <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[11px]">
                {categoryText}
              </span>
            ) : (
              <span className="select-none text-[10px] font-semibold uppercase tracking-wider text-transparent sm:text-[11px]">
                Category
              </span>
            )}
          </div>

          {/* Product Title */}
          <Link
            href={`/product/${product?.slug?.current}`}
            className="group/title block"
          >
            <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-slate-900 transition-colors duration-200 group-hover/title:text-shop-dark-green sm:text-sm">
              {product?.title || "Untitled Product"}
            </h3>
          </Link>

          {/* Rating and Stock Status */}
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5 pt-1">

            {/* Actual Approved Review Rating */}
            <div
              className="flex min-w-0 items-center gap-1.5"
              aria-label={
                hasReviews
                  ? `${averageRating.toFixed(1)} out of 5 stars from ${reviewCount} reviews`
                  : "No customer reviews yet"
              }
            >
              <div className="flex shrink-0 items-center gap-0.5">
                {[...Array(5)].map((_, index) => (
                  <StarIcon
                    key={index}
                    size={12}
                    className={
                      hasReviews && index < Math.round(averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-slate-200 text-slate-200"
                    }
                  />
                ))}
              </div>

              {hasReviews ? (
                <span className="whitespace-nowrap text-[10px] font-medium text-slate-600 sm:text-[11px]">
                  {averageRating.toFixed(1)}
                  <span className="ml-1 text-slate-400">
                    ({reviewCount})
                  </span>
                </span>
              ) : (
                <span className="whitespace-nowrap text-[10px] font-medium text-slate-400 sm:text-[11px]">
                  No reviews
                </span>
              )}
            </div>

            {/* Inventory Status */}
            <div className="flex shrink-0 items-center">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-600 sm:text-[11px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  Out of Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 sm:text-[11px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  In Stock
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. PRICING & PRIMARY ACTION */}
        <div className="mt-auto flex flex-col gap-1 border-t border-slate-100 pt-1.5 sm:gap-1.5 sm:pt-2">
          <PriceView
            price={product.price}
            discount={product.discount}
            className="min-h-0"
          />

          <AddToCartButton
            product={product}
            className="w-full rounded-md bg-shop-dark-green py-2 text-xs font-medium text-white shadow-xs transition-all duration-200 hover:bg-shop-dark-green/90 hover:shadow-sm active:scale-[0.99] sm:py-2.5 sm:text-sm"
          />
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
