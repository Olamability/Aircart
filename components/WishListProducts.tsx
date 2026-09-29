"use client";

import useStore from "@/store";
import Link from "next/link";
import { useState } from "react";
import React from "react";
import { Heart, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import Container from "@/components/Container";
import toast from "react-hot-toast";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import PriceFormat from "./PriceFormat";
import AddToCartButton from "./AddToCartButton";
import type { Product } from "@/sanity.types";
const WishListProducts = () => {
  const [visibleProducts, setVisibleProducts] = useState(7);

  const favoriteProduct = useStore((state) => state.favoriteProduct);
  const removeFromFavorite = useStore((state) => state.removeFromFavorite);
  const resetFavorite = useStore((state) => state.resetFavorite);

  const loadMore = () => {
    setVisibleProducts((prev) => Math.min(prev + 5, favoriteProduct.length));
  };
  const loadLess = () => {
    setVisibleProducts((prev) => Math.max(prev - 5, 7));
  };
  const handleResetWishlist = () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset your wishlist?",
    );
    if (confirmReset) {
      resetFavorite();
      toast.success("Wishlist reset successfully");
    }
  };

  return (
    <Container>
      {favoriteProduct.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="border-b">
                <tr className="bg-black/5">
                  <th className="p-2 text-left">Image</th>
                  <th className="p-2 text-left hidden md:table-cell">
                    Category
                  </th>
                  <th className="p-2 text-left hidden md:table-cell">Type</th>
                  <th className="p-2 text-left hidden md:table-cell">Stock</th>
                  <th className="p-2 text-left">Price</th>
                  <th className="p-2 text-left md:table-cell">Action</th>
                </tr>
              </thead>
              <tbody>
                {favoriteProduct
                  ?.slice(0, visibleProducts)
                  ?.map((product: Product) => (
                    <tr key={product?._id} className="border-b">
                      <td className="px-2 py-4 flex items-center gap-2">
                        <X
                          onClick={() => {
                            removeFromFavorite(product?._id);
                            toast.success(
                              "Product successfully removed from wishlist",
                            );
                          }}
                          size={18}
                          className="hover:text-red-600 hover:cursor-pointer hoverEffect"
                        />
                        {product?.image && (
                          <Link
                            href={`/product/${product?.slug?.current}`}
                            className="border rounded-md group inline-flex"
                          >
                            <Image
                              src={urlFor(product?.image[0]).url()}
                              alt={product?.title || "Product image"}
                              width={80}
                              height={80}
                              className="rounded-md h-14 w-14 md:h-20 md:w-20 object-contain group-hover:scale-105 hoverEffect"
                            />
                          </Link>
                        )}
                        <p className="line-clamp-1">{product?.title}</p>
                      </td>
                      <td className="p-2 capitalize hidden md:table-cell">
                        {product?.categories && (
                          <p className="uppercase line-clamp-1 text-xs font-medium">
                            {product.categories?.map((cat) => cat._ref).join(", ")}
                          </p>
                        )}
                      </td>
                      <td className="p-2 capitalize hidden md:table-cell">
                        {product?.status}
                      </td>
                      <td className="p-2 hidden md:table-cell">
                        {(product?.stock as number) > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            In Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Out of Stock
                          </span>
                        )}
                      </td>
                      <td className="p-2">
                        <PriceFormat amount={product?.price} />
                      </td>
                      <td className="p-2">
                        <AddToCartButton product={product} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {visibleProducts < favoriteProduct.length && (
              <div className="my-5">
                <Button variant="outline" onClick={loadMore}>
                  Load More
                </Button>
              </div>
            )}
            {visibleProducts > 10 && (
              <div className="my-5">
                <Button variant="outline" onClick={loadLess}>
                  Load Less
                </Button>
              </div>
            )}
            {favoriteProduct?.length > 0 && (
              <Button
                onClick={handleResetWishlist}
                className="mb-5 font-semibold"
                variant="destructive"
                size="lg"
              >
                Reset Wishlist
              </Button>
            )}
          </div>
        </>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center space-y-6 px-4 text-center">
          <div className="relative mb-4">
            <div className="absolute -top-1 -right-1 h-4 w-4 animate-ping rounded-full bg-muted-foreground/20" />

            <Heart
              className="h-12 w-12 text-muted-foreground"
              strokeWidth={1.5}
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Your wishlist is empty
            </h2>

            <p className="text-sm text-muted-foreground">
              Items added to your wishlist will appear here
            </p>
          </div>

          <Link href="/shop" className={buttonVariants()}>
            Continue Shopping
          </Link>
        </div>
      )}
    </Container>
  );
};

export default WishListProducts;
