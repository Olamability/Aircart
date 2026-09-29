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
    <div
      className={cn("flex min-w-0 items-baseline gap-1.5 sm:gap-2", className)}
    >
      <PriceFormat
        amount={discountedPrice}
        className={cn(
          "min-w-0 text-sm text-[10px] font-semibold tracking-tight text-shop-dark-green sm:text-xs",
          priceClassName,
        )}
      />

      {hasDiscount && (
        <PriceFormat
          amount={price}
          className={cn(
            "shrink-0 whitespace-nowrap text-[9px] font-normal text-slate-400 line-through sm:text-[11px]",
            discountClassName,
          )}
        />
      )}
    </div>
  );
};

export default PriceView;
