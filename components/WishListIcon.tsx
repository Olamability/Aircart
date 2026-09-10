import React from "react";
import { Product } from "@/sanity.types";
import { HeartIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const WishListIcon = ({ className }) => {
  return (
    <div className={cn("absolute top-2 right-2 z-10", className)}>
      <button
        type="button"
        aria-label="Add to wishlist"
        className="p-2.5 rounded-full hover:bg-shop-btn-dark-green hover:text-white hoverEffect bg-white/50"
      >
        <HeartIcon size={15} />
      </button>
    </div>
  );
};

export default WishListIcon;
