import { Product } from "@/sanity.types";
import { Heart } from "lucide-react";
import Link from "next/link";
import React from "react";

const FavouriteButton = ({
  showProduct = false,
  product,
  className,
}: {
  showProduct?: boolean;
  product: Product | null | undefined;
  className?: string;
}) => {
  return (
    <>
      {!showProduct ? (
        <Link href={"/whishlist"} className="group relative">
          <Heart className="w-5 h-5 hover:text-shop-light-green hoverEffect" />
          <span className="absolute -top-1 -right-3 bg-shop-dark-green text-white h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center">
            0
          </span>
        </Link>
      ) : (
        <button className="group relative hover:text-shop-light-green hoverEffect border border-shop-light-green/80 hover:border-shop-light-green p-1.5 rounded-sm">
          <Heart className="text-shop-light-green/80 group-hover:text-shop-light-green hoverEffecr mt-0.5 w-5 h-5" />
        </button>
      )}
    </>
  );
};

export default FavouriteButton;
