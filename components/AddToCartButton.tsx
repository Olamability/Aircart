"use client";

import React from "react";
import { Button } from "./ui/button";
import { ShoppingBag } from "lucide-react";
import { Product } from "@/sanity.types";
import { cn } from "@/lib/utils";
import useStore from "@/store";
import toast from "react-hot-toast";
import QuantityButtons from "./QuantityButtons";

interface Props {
  product: Product;
  className?: string;
}

const AddToCartButton = ({ product, className }: Props) => {
  const { addItem, getItemCount, hasHydrated } = useStore();
  const itemCount = hasHydrated ? getItemCount(product?._id) : 0;
  const isOutOfStock = (product?.stock as number) <= 0;

  const handleAddToCart = () => {
    if ((product?.stock as number) > itemCount) {
      addItem(product);
      toast.success(`${product?.title?.substring(0, 12)}.....added to cart`);
    } else {
      toast.error("Can not add more than available stock");
    }
  };

  return (
    <div className="flex h-9 w-full min-w-0 items-center sm:h-10">
      {itemCount ? (
        <div className="flex h-full w-full min-w-0 items-center rounded-xl border border-slate-200/90 bg-slate-50/90 px-2 sm:px-3">
          <div className="flex w-full min-w-0 items-center justify-between gap-1 sm:gap-1.5">
            <span className="min-w-0 shrink-0 whitespace-nowrap text-xs font-normal text-slate-700">
              In Cart
            </span>

            <QuantityButtons product={product} className="shrink-0" />
          </div>
        </div>
      ) : (
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={cn(
            "h-full w-full bg-shop-dark-green text-white shadow-xs font-semibold tracking-wide hover:bg-shop-dark-green/90 transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
            className,
          )}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      )}
    </div>
  );
};

export default AddToCartButton;
