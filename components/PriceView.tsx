import React from "react";
import PriceFormat from "./PriceFormat";
import { cn } from "@/lib/utils";

interface Props {
  price: number | undefined;
  discount: number | undefined;
  className?: string;
  priceClassName?: string;
  discountClassName?: string;
}

const PriceView = ({
  price,
  discount,
  className,
  priceClassName,
  discountClassName,
}: Props) => {
  const hasDiscount = !!price && !!discount;
  const discountedPrice = hasDiscount
    ? price - (discount * price) / 100
    : price;

  return (
    <div className={cn("flex items-baseline gap-2 flex-wrap min-h-7", className)}>
      <PriceFormat
        amount={discountedPrice}
        className={cn(
          "text-sm sm:text-base font-bold text-shop-dark-green tracking-tight",
          priceClassName,
        )}
      />
      {hasDiscount && (
        <PriceFormat
          amount={price}
          className={cn(
            "line-through text-xs font-normal text-slate-400 whitespace-nowrap",
            discountClassName,
          )}
        />
      )}
    </div>
  );
};

export default PriceView;
