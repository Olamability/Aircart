import useStore from "@/store";
import React from "react";
import { Button } from "@base-ui/react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Product } from "@/sanity.types";

interface Props {
  product: Product;
  className?: string;
}

const QuantityButtons = ({ product, className }: Props) => {
  const { addItem, removeItem, getItemCount } = useStore();
  const itemCount = getItemCount(product?._id);
  const isOutOfStock = product?.stock === 0;

  const handleIncrease = () => {
    if ((product?.stock as number) > itemCount) {
      addItem(product);
      toast.success("Quantity Increased Successfully!");
    } else {
      toast.error(
        `Cannot add more than only ${product.stock} available ${product.title}.`,
      );
    }
  };

  const handleDecrease = () => {
    removeItem(product?._id);
    if (itemCount > 1) {
      toast.success("Quantity Decreased Successfully");
    } else {
      toast.success(
        `${product?.title?.substring(0, 12)} removed successfully!`,
      );
    }
  };

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-lg border border-slate-200/90 bg-white p-0.5 shadow-2xs",
        className,
      )}
    >
      <Button
        type="button"
        onClick={handleDecrease}
        aria-label="Decrease quantity"
        className="flex h-5 w-5 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95"
      >
        <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </Button>

      <span className="min-w-5 shrink-0 select-none text-center text-xs font-semibold text-slate-900">
        {itemCount}
      </span>

      <Button
        type="button"
        onClick={handleIncrease}
        disabled={isOutOfStock || (product?.stock as number) <= itemCount}
        aria-label="Increase quantity"
        className="flex h-5 w-5 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
      >
        <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </Button>
    </div>
  );
};

export default QuantityButtons;
