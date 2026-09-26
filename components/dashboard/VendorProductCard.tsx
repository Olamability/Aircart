import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, Edit, ExternalLink, Star, AlertTriangle } from "lucide-react";
import type { VendorProductWithBrand } from "@/lib/vendorProduct";
import { urlFor } from "@/sanity/lib/image";
import StatusBadge from "@/components/dashboard/StatusBadge";
import PriceView from "@/components/PriceView";

interface VendorProductCardProps {
  product: VendorProductWithBrand;
}

const VendorProductCard: React.FC<VendorProductCardProps> = ({ product }) => {
  const imageUrl =
    product.image && product.image[0]
      ? urlFor(product.image[0]).width(400).height(400).url()
      : null;

  const stock = product.stock ?? 0;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;

  const categoryNames =
    product.categories && product.categories.length > 0
      ? product.categories.map((c) => c.title).join(", ")
      : null;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      {/* Fixed-Height Product Image Area */}
      <div className="relative h-48 w-full shrink-0 overflow-hidden border-b border-slate-100 bg-slate-50 flex items-center justify-center">
        {/* Status Badge (Top-Left) */}
        <div className="absolute left-2.5 top-2.5 z-10">
          <StatusBadge status={product.status || "available"} />
        </div>

        {/* Featured / New Badges (Top-Right) */}
        <div className="absolute right-2.5 top-2.5 z-10 flex flex-col items-end gap-1">
          {product.isfeatured && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
              <Star className="h-2.5 w-2.5 fill-current" />
              Featured
            </span>
          )}
          {product.isNew && (
            <span className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">
              New
            </span>
          )}
        </div>

        {/* Image Display */}
        {imageUrl ? (
          <div className="relative h-full w-full p-4">
            <Image
              src={imageUrl}
              alt={product.title || "Product image"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={`object-contain p-2 transition-transform duration-300 group-hover:scale-105 ${
                isOutOfStock ? "opacity-60" : ""
              }`}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 text-slate-400">
            <Package className="h-8 w-8 text-slate-300" />
            <span className="text-xs font-medium">No image available</span>
          </div>
        )}
      </div>

      {/* Information Area */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Brand */}
        <div className="min-h-4">
          <span className="block truncate text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {product.brand?.title || "Brand Unspecified"}
          </span>
        </div>

        {/* Product Title */}
        <h3
          className="min-h-[2.5rem] text-sm font-bold text-slate-900 line-clamp-2 transition-colors group-hover:text-shop-dark-green"
          title={product.title}
        >
          {product.title}
        </h3>

        {/* Category */}
        <div className="min-h-4">
          <p className="truncate text-xs text-slate-500">
            {categoryNames || "Uncategorized"}
          </p>
        </div>

        {/* Price & Stock Section */}
        <div className="mt-1 flex items-center justify-between gap-2">
          <div>
            <PriceView price={product.price} discount={product.discount} />
          </div>

          <div>
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                <AlertTriangle className="h-3 w-3" />
                Stock: {stock}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                Stock: {stock}
              </span>
            )}
          </div>
        </div>

        {/* Actions Area pinned to bottom */}
        <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-3">
          <Link
            href={`/vendor/products/${product._id}/edit`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-shop-light-green px-3.5 py-2 text-center text-xs font-semibold text-white shadow-xs hover:bg-shop-dark-green hoverEffect"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit Product
          </Link>

          {product.slug?.current && (
            <Link
              href={`/product/${product.slug.current}`}
              target="_blank"
              rel="noreferrer"
              title="View on Storefront"
              className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorProductCard;
