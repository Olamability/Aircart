"use client";
import React from "react";
import { Product } from "@/sanity.types";
import useStore from "@/store";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const FavoriteIcon = ({
  product,
  className,
}: {
  product: Product;
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
    if (product._id) {
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
    <div className={cn("absolute top-2 right-2 z-10", className)}>
      <div
        onClick={handleFavorite}
        className={`p-1.5 rounded-md hover:cursor-pointer hover:bg-white
         hover:text-white hoverEffect ${existingProduct ? "bg-shop-lighter-bg text-white" : "bg-gray-300"}`}
      >
        <Heart
          size={15}
          fill={existingProduct ? "#ef4444" : "none"}
          className={
            existingProduct ? "text-red-500" : "text-shop-light-green/80"
          }
        />
      </div>
    </div>
  );
};

export default FavoriteIcon;
