
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ShoppingBag, ArrowRight } from "lucide-react";
import type { Product } from "@/sanity.types";
import { cn } from "@/lib/utils";
import useStore from "@/store";
import toast from "react-hot-toast";
import QuantityButtons from "./QuantityButtons";

interface Props {
  product: Product;
  className?: string;
}

const AddToCartButton = ({ product, className }: Props) => {
  const router = useRouter();
  const { addItem, getItemCount, hasHydrated } = useStore();

  const itemCount = hasHydrated ? getItemCount(product?._id) : 0;

  const stock = product?.stock;
  const hasValidStock =
    typeof stock === "number" &&
    Number.isFinite(stock) &&
    stock >= 0;

  const availableStock = hasValidStock ? stock : 0;
  const isOutOfStock = availableStock <= 0;

  const handleAddToCart = () => {
    if (!hasHydrated) return;

    if (!hasValidStock || itemCount >= availableStock) {
      toast.error(
        hasValidStock
          ? "Cannot add more than available stock"
          : "This product is currently unavailable.",
      );
      return;
    }

    addItem(product);
    toast.success(
      `${product?.title?.substring(0, 12)}.....added to cart`,
    );
  };

  const handleProceedToCheckout = () => {
    if (!hasHydrated || itemCount <= 0) {
      toast.error("Please add this product to your cart first.");
      return;
    }

    router.push("/cart");
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      {itemCount > 0 ? (
        <>
          <div className="flex h-9 w-full min-w-0 items-center rounded-xl border border-slate-200/90 bg-slate-50/90 px-2 sm:h-10 sm:px-3">
            <div className="flex w-full min-w-0 items-center justify-between gap-1 sm:gap-1.5">
              <span className="min-w-0 shrink-0 whitespace-nowrap text-xs font-normal text-slate-700">
                In Cart
              </span>

              <QuantityButtons product={product} className="shrink-0" />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleProceedToCheckout}
            className="h-10 w-full bg-shop-dark-green font-semibold text-white shadow-xs transition-all duration-200 hover:bg-shop-dark-green/90"
          >
            Proceed to Checkout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </>
      ) : (
        <Button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || !hasHydrated}
          className={cn(
            "h-10 w-full bg-shop-dark-green font-semibold tracking-wide text-white shadow-xs transition-all duration-200 hover:bg-shop-dark-green/90 disabled:pointer-events-none disabled:opacity-50",
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
