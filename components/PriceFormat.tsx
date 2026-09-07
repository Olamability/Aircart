import React from "react";
import { cn } from "@/lib/utils";

interface Props {
  amount: number | undefined;
  className?: string;
}

const PriceFormat = ({ amount, className }: Props) => {
  const formattedPrice = new Number(amount).toLocaleString("en-NG", {
    currency: "NGN",
    style: "currency",
    minimumFractionDigits: 2,
  });
  return (
    <span className={cn("text-shop-dark-green font-semibold text-sm", className)}
    >
      {formattedPrice}
      {/* ₦{amount?.toLocaleString("en-NG")} */}
    </span>
  );
};

export default PriceFormat;
