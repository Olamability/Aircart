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
    <div className={cn("inline-flex items-center gap-1.5 bg-white rounded-lg border border-slate-200/90 p-0.5 shadow-2xs", className)}>
      <Button
        type="button"
        onClick={handleDecrease}
        aria-label="Decrease quantity"
        className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-md flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
      >
        <Minus className="w-3.5 h-3.5" />
      </Button>
      <span className="font-semibold text-xs sm:text-sm min-w-6 text-center text-slate-900 select-none">
        {itemCount}
      </span>
      <Button
        type="button"
        onClick={handleIncrease}
        disabled={isOutOfStock || (product?.stock as number) <= itemCount}
        aria-label="Increase quantity"
        className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-md flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
      >
        <Plus className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};

export default QuantityButtons;
