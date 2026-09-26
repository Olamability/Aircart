import React from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";

const EmptyCart = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center py-12 md:py-20">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-8 sm:p-12 text-center shadow-xs">
        {/* Shopping Bag Illustration */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100/80 shadow-2xs">
          <ShoppingBag className="h-10 w-10 text-shop-dark-green stroke-[1.75]" />
        </div>

        {/* Heading */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Your Shopping Cart is Empty
        </h2>

        {/* Description */}
        <p className="mt-2.5 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          Looks like you haven&apos;t added any items to your cart yet. Explore our curated marketplace to discover fresh arrivals and deals.
        </p>

        {/* CTA */}
        <div className="mt-8 flex justify-center">
          <Link href="/shop">
            <Button
              size="lg"
              className="h-11 rounded-xl bg-shop-dark-green px-7 text-sm font-semibold text-white hover:bg-shop-dark-green/90 transition-all duration-200 shadow-xs cursor-pointer"
            >
              Explore Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmptyCart;
