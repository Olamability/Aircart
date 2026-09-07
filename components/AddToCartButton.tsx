"use client"
import React from 'react';
import { Button } from './ui/button';
import { ShoppingBag } from 'lucide-react';
import { Product } from '@/sanity.types';
import { cn } from '@/lib/utils';

interface Props {
  product: Product;
  className?: string;
}

const AddToCartButton = ({ product, className }: Props) => {
  const isOutofStock = product?.stock === 0;
  const handleAddToCart = ()=> {
    window.alert(`${product.title} added to cart`);
  }
  return (
    <div>
    <Button 
    onClick={handleAddToCart}
    disabled={isOutofStock}
    className={cn(
      "w-full bg-shop-dark-green/80 text-lightbg shadow-none border border-shop-dark-green/80 font-semibold tracking-wide hover:text-white hover:bg-shop-dark-green hover:border-shop-dark-green hoverEffect")}>
        <ShoppingBag className="w-5 h-5"/> {isOutofStock ? "Out of Stock" : "Add to Cart" }
            
      </Button>
    </div>
  )
}

export default AddToCartButton
