
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
  const hasValidPrice =
    typeof price === "number" &&
    Number.isFinite(price) &&
    price >= 0;

  const hasValidDiscount =
    typeof discount === "number" &&
    Number.isFinite(discount) &&
    discount > 0;

  const safePrice = hasValidPrice ? price : 0;

  const safeDiscount = hasValidDiscount
    ? Math.min(discount, 100)
    : 0;

  const hasDiscount = hasValidPrice && safeDiscount > 0;

  const discountedPrice =
    safePrice - (safePrice * safeDiscount) / 100;

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-start gap-0.5",
        className,
      )}
    >
      {/* Original price: reserved space keeps selling prices aligned */}
      <div className="flex min-h-[14px] items-center">
        {hasDiscount ? (
          <PriceFormat
            amount={safePrice}
            className={cn(
              "text-[11px] font-medium leading-none text-slate-400 line-through",
              discountClassName,
            )}
          />
        ) : (
          <span aria-hidden="true" className="invisible text-[11px] leading-none">
            ₦0
          </span>
        )}
      </div>

      {/* Main selling price: consistent position across product cards */}
      <PriceFormat
        amount={discountedPrice}
        className={cn(
          "text-base font-bold leading-tight tracking-tight text-shop-dark-green sm:text-lg",
          priceClassName,
        )}
      />
    </div>
  );
};

export default PriceView;
