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

  // const itemCount = getItemCount(product?._id);
  // const isOutOfStock = product?.stock === 0;

  return (
    <div className={cn("flex items-center gap-1 pb-1 text-base", className)}>
      <Button
        onClick={handleDecrease}
        className="border-[1px] border-shop-orange/50 hover:bg-shop-dark-green/20 hoverEffect"
      >
        <Minus className="w-4 h-4" />
      </Button>
      <span className="font-semibold text-sm w-6 text-center text-darkColor">
        {itemCount}
      </span>
      <Button
        type="button"
        onClick={handleIncrease}

        className="border-[1px] border-shop-orange/50 hover:bg-shop-dark-green/20 hoverEffect"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default QuantityButtons;
