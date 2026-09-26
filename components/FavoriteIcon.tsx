"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/sanity.types";
import useStore from "@/store";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const FavoriteIcon = ({
  product,
  className,
  buttonClassName,
  iconSize = 15,
}: {
  product: Product;
  className?: string;
  buttonClassName?: string;
  iconSize?: number;
}) => {
  const { favoriteProduct, addToFavorite } = useStore();
  const [existingProduct, setExistingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const availableProduct = favoriteProduct?.find(
      (item) => item?._id === product?._id,
    );
    setExistingProduct(availableProduct || null);
  }, [product, favoriteProduct]);

  const handleFavorite = (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (product._id) {
      addToFavorite(product).then(() => {
        toast.success(
          existingProduct
            ? "Product removed from wishlist"
            : "Product added to wishlist",
        );
      });
    }
  };

  return (
    <div className={cn("absolute top-2.5 right-2.5 z-10", className)}>
      <button
        type="button"
        onClick={handleFavorite}
        aria-label={existingProduct ? "Remove from wishlist" : "Add to wishlist"}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 shadow-xs cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30",
          existingProduct
            ? "bg-rose-50 border border-rose-200 text-rose-500 hover:bg-rose-100 hover:scale-105 active:scale-95"
            : "bg-white/95 backdrop-blur-xs border border-slate-200/80 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-white hover:scale-105 active:scale-95",
          buttonClassName,
        )}
      >
        <Heart
          size={iconSize}
          fill={existingProduct ? "currentColor" : "none"}
          className={existingProduct ? "text-rose-500" : "text-current"}
        />
      </button>
    </div>
  );
};

export default FavoriteIcon;
