import React from "react";
import PriceFormat from "./PriceFormat";
interface Props {
  price: number | undefined;
  discount: number | undefined;
  className?: string;
}
const PriceView = ({ price, discount, className }: Props) => {
  const hasDiscount = !!price && !!discount;
  const discountedPrice = hasDiscount
    ? price - (discount * price) / 100
    : price;
  return (
    <div className={`flex items-center gap-2 min-h-8 ${className || ""}`}>
      {" "}
      <PriceFormat
        amount={discountedPrice}
        className="text-shop-dark-green"
      />{" "}
      {hasDiscount && (
        <PriceFormat
          amount={price}
          className="line-through text-xs font-normal text-shop-light-text whitespace-nowrap"
        />
      )}{" "}
    </div>
  );
};
export default PriceView;
