import React from "react";
import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

const EmptyCart = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center py-10 md:py-16">
      <Card className="w-full max-w-xl overflow-hidden border-gray-200 bg-white shadow-sm">
        <CardContent className="flex flex-col items-center px-5 py-10 text-center sm:px-8 sm:py-14">
          {/* Shopping Cart Illustration */}
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-shop-light-green/10">
            <ShoppingCart className="h-12 w-12 text-shop-dark-green" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-darkColor sm:text-3xl">
            Your Cart is Empty
          </h2>

          {/* Description */}
          <p className="mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
            It looks like you haven&apos;t added any product to your cart yet.
            Let&apos;s change that and find some amazing products for you!
          </p>

          {/* CTA */}
          <Link href="/shop" className="mt-7">
            <Button
              size="lg"
              className="rounded-md bg-shop-dark-green px-7 text-white hover:bg-shop-dark-green/90"
            >
              Explore Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmptyCart;
