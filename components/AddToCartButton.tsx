"use client";

import React from "react";
import { Button } from "./ui/button";
import { ShoppingBag } from "lucide-react";
import { Product } from "@/sanity.types";
import { cn } from "@/lib/utils";
import useStore from "@/store";
import toast from "react-hot-toast";
import PriceFormat from "./PriceFormat";
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
    <div className="flex w-full min-w-0 flex-col justify-center">
      {itemCount ? (
        <div className="w-full min-w-0 rounded-xl border border-slate-200/90 bg-slate-50/90 px-2 py-2 transition-all sm:px-3">
          <div className="flex min-w-0 items-center justify-between gap-1 sm:gap-1.5">
            <span className="min-w-0 shrink-0 whitespace-nowrap text-xs font-normal text-slate-700">
              In Cart
            </span>

            <QuantityButtons product={product} className="shrink-0" />
          </div>

          <div className="mt-1.5 flex min-w-0 items-center justify-between gap-2 border-t border-slate-200/70 pt-1.5">
            <span className="shrink-0 text-xs font-medium text-slate-500">
              Subtotal
            </span>

            <PriceFormat
              amount={product?.price ? product?.price * itemCount : 0}
              className="min-w-0 truncate text-xs font-bold text-shop-dark-green"
            />
          </div>
        </div>
      ) : (
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={cn(
            "w-full bg-shop-dark-green text-white shadow-xs font-semibold tracking-wide hover:bg-shop-dark-green/90 transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
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
