"use client";
import { Product } from "@/sanity.types";
import { Heart } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import useStore from "@/store";
import toast from "react-hot-toast";

const FavouriteButton = ({
  showProduct = false,
  product,
  className,
}: {
  showProduct?: boolean;
  product?: Product | null | undefined;
  className?: string;
}) => {
  const { favoriteProduct, addToFavorite } = useStore();
  const [existingProduct, setExistingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const availableProduct = favoriteProduct?.find(
      (item) => item?._id === product?._id,
    );
    setExistingProduct(availableProduct || null);
  }, [product, favoriteProduct]);

  const handleFavorite = (e: React.MouseEvent<HTMLSpanElement>) => {
    // window.alert("Fav button tapped");
    e.preventDefault();
    if (product?._id) {
      addToFavorite(product).then(() => {
        toast.success(
          existingProduct
            ? "Product removed successfully"
            : " Product addedd sucessfully",
        );
      });
    }
  };
  return (
    <>
      {!showProduct ? (
        <Link href={"/wishlist"} className="group relative">
          <Heart className="w-5 h-5 hover:text-shop-light-green hoverEffect" />
          <span
            className="absolute -top-1 -right-2 bg-red-600 text-white 
          h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center"
          >
            {favoriteProduct?.length ? favoriteProduct?.length : 0}
          </span>
        </Link>
      ) : (
        <button
          className="group relative hover:text-shop-light-green hoverEffect 
        border border-shop-light-green/80 hover:border-shop-light-green p-1.5 
        rounded-sm"
        >
          {existingProduct ? (
            <Heart
              fill={existingProduct ? "#ef4444" : "none"}
              className={
                existingProduct ? "text-red-500" : "text-shop-light-green/80"
              }
            />
          ) : (
            <Heart
              fill="none"
              className="text-shop-light-green/80 group-hover:text-shop-light-green hoverEffect mt-0.5 w-5 h-5"
            />
          )}
        </button>
      )}
    </>
  );
};

export default FavouriteButton;
