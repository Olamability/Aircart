import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import { Flame, StarIcon, Package } from "lucide-react";
import PriceView from "./PriceView";
import AddToCartButton from "./AddToCartButton";
import FavoriteIcon from "./FavoriteIcon";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const isOutOfStock = (product?.stock as number) <= 0;

  // Format category string safely whether passed as array of strings or references
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
      <div className="relative w-full aspect-square bg-linear-to-b from-slate-50/90 via-slate-50/50 to-slate-100/60 p-3.5 sm:p-5 flex items-center justify-center overflow-hidden shrink-0">
        {product?.image?.[0] ? (
          <Link
            href={`/product/${product?.slug?.current}`}
            className="relative flex items-center justify-center w-full h-full"
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
              className={`w-full h-full object-contain object-center transition-transform duration-500 ease-out group-hover:scale-105 ${
                isOutOfStock ? "opacity-40 grayscale" : ""
              }`}
            />
          </Link>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400 p-4 text-center">
            <Package className="w-8 h-8 stroke-1 text-slate-300" />
            <span className="text-xs font-medium">No image available</span>
          </div>
        )}

        {/* Status / Deal Badges (Top-Left) */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1 pointer-events-none">
          {product?.status === "hot" && (
            <Link
              href="/deal"
              className="pointer-events-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wide bg-amber-500/10 text-amber-800 border border-amber-500/30 backdrop-blur-xs hover:bg-amber-500 hover:text-white transition-all duration-200 shadow-2xs group/deal"
            >
              <Flame className="w-3 h-3 fill-amber-500 text-amber-500 group-hover/deal:fill-white group-hover/deal:text-white transition-colors" />
              <span>Hot Deal</span>
            </Link>
          )}

          {product?.status === "new" && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wide bg-shop-dark-green text-white shadow-2xs">
              New Arrival
            </span>
          )}

          {product?.status === "available" && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-white/95 text-slate-700 border border-slate-200/90 backdrop-blur-xs shadow-2xs">
              Available
            </span>
          )}

          {product?.status === "sale" && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wide bg-rose-600 text-white shadow-2xs">
              Sale
            </span>
          )}

          {Boolean(product?.discount && product.discount > 0) && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Favorite Wishlist Icon (Top-Right) */}
        <FavoriteIcon product={product} className="top-2.5 right-2.5 z-10" />
      </div>

      {/* 2. PRODUCT DETAILS & ACTIONS */}
      <div className="flex flex-1 flex-col gap-1.5 p-2 sm:gap-2 sm:p-3.5">
        <div className="flex flex-col gap-1">
          {/* Category / Taxonomy */}
          <div className="flex min-h-4 items-center">
            {categoryText ? (
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
                {categoryText}
              </span>
            ) : (
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-transparent select-none">
                Category
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            href={`/product/${product?.slug?.current}`}
            className="group/title block"
          >
            <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-slate-900 transition-colors duration-200 group-hover/title:text-shop-dark-green sm:text-sm">
              {product?.title || "Untitled Product"}
            </h3>
          </Link>

          {/* Social Proof (Stars) & Live Inventory */}
          <div className="flex flex-col gap-1 pt-0.5 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-1">
            {/* Reviews */}
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, index) => (
                  <StarIcon
                    key={index}
                    size={12}
                    className={
                      index < 4
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-200 fill-slate-200"
                    }
                  />
                ))}
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                5 Reviews
              </span>
            </div>

            {/* Stock Indicator */}
            <div className="min-w-0 shrink-0">
              {!isOutOfStock ? (
                <span className="inline-flex max-w-full shrink-0 items-center gap-1 whitespace-nowrap text-xs font-medium text-emerald-700">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>In Stock</span>
                </span>
              ) : (
                <span className="inline-flex max-w-full shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-rose-600">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                  <span>Out of Stock</span>
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
