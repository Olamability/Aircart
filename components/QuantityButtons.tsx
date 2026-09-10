import useStore from "@/store";
import React from "react";
import { Button } from "@base-ui/react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Props {
  product: Product;
  className?: string;
}

const QuantityButtons = ({ product, className }: Props) => {
  const { addItem, removeItem, getItemCount } = useStore();
  const itemCount = getItemCount(product?._id);
  const isOutOfStock = product?.stock === 0;

  const handleIncrease = () => {
    if (itemCount < product.stock) {
      addItem(product);
      toast.success(`${product.title}...Added to cart`);
    } else {
      toast.error(
        `Cannot add more ${product.title}. Only ${product.stock} available.`,
      );
    }
  };
  const handleDecrease = () => {
    if (itemCount > 0) {
      removeItem(product._id);
      toast.success(`${product.title}...Removed from cart`);
    }
  };

  // const itemCount = getItemCount(product?._id);
  // const isOutOfStock = product?.stock === 0;

  return (
    <div className={cn("flex items-center gap-1 pb-1 text-base", className)}>
      <Button
        type="button"
        onClick={handleDecrease}
        className="border border-2 border-shop-orange"
      >
        <Minus className="w-4 h-4" />
      </Button>
      <span className=" text-sm">{itemCount}</span>
      <Button
        type="button"
        onClick={handleIncrease}

        className="border border-2 border-shop-orange"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default QuantityButtons;
