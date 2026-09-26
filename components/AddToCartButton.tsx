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
    <div className="w-full flex flex-col justify-center">
      {itemCount ? (
        <div className="w-full bg-slate-50/90 border border-slate-200/90 rounded-xl px-3 py-2 transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">
              In Cart
            </span>
            <QuantityButtons product={product} />
          </div>
          <div className="flex items-center justify-between border-t border-slate-200/70 pt-1.5 mt-1.5">
            <span className="text-xs text-slate-500 font-medium">Subtotal</span>
            <PriceFormat
              amount={product?.price ? product?.price * itemCount : 0}
              className="text-xs font-bold text-shop-dark-green"
            />
          </div>
        </div>
      ) : (
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={cn(
            "w-full bg-shop-dark-green text-white shadow-xs font-semibold tracking-wide hover:bg-shop-dark-green/90 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
            className,
          )}
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      )}
    </div>
  );
};

export default AddToCartButton;
