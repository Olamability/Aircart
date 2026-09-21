import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import { Flame, StarIcon } from "lucide-react";
import { Title } from "./text";
import PriceView from "./PriceView";
import AddToCartButton from "./AddToCartButton";
import FavoriteIcon from "./FavoriteIcon";
const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="h-full text-sm border border-dark-blue/50 rounded-md bg-white group flex flex-col">
      {" "}
      <div className="relative group overflow-hidden bg-shop-light-bg h-64 shrink-0">
        {" "}
        {product?.image?.[0] ? (
          <Link
            href={`/product/${product?.slug?.current}`}
            className="block h-full w-full"
          >
            {" "}
            <Image
              src={urlFor(product.image[0]).url()}
              alt={product.title ?? "Product image"}
              loading="lazy"
              width={500}
              height={500}
              className={`w-full h-full object-contain overflow-hidden transition-transform bg-shop-light-bg hoverEffect ${product?.stock !== 0 ? "group-hover:scale-105" : "opacity-50"}`}
            />{" "}
          </Link>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-shop-light-text">
            {" "}
            No image available{" "}
          </div>
        )}{" "}
        <FavoriteIcon product={product} />{" "}
        {product?.status === "new" && (
          <p className="absolute top-2 left-2 z-10 text-sm border border-darkColor/50 px-2 rounded-full group-hover:border-shop-light-green group-hover:text-shop-light-green hoverEffect">
            {" "}
            New Arrival{" "}
          </p>
        )}{" "}
        {product?.status === "available" && (
          <p className="absolute top-2 left-2 z-10 text-sm border border-darkColor/50 px-2 rounded-full group-hover:border-shop-light-green group-hover:text-shop-light-green hoverEffect">
            {" "}
            Available{" "}
          </p>
        )}{" "}
        {product?.status === "hot" && (
          <Link
            href={"/deal"}
            className="absolute top-2 left-2 z-10 text-sm border border-shop-orange/50 p-1 rounded-full group-hover:border-shop-orange group-hover:text-shop-dark-green hoverEffect"
          >
            {" "}
            <Flame
              size={18}
              fill="#fb6c08"
              className="text-shop-orange/50 group-hover:text-shop-orange hoverEffect"
            />{" "}
          </Link>
        )}{" "}
      </div>{" "}
      <div className="p-3 flex flex-col gap-2 flex-1">
        {" "}
        <div className="h-4">
          {" "}
          {product?.categories && (
            <p className="uppercase text-xs line-clamp-1 text-shop-light-text">
              {" "}
              {product.categories.map((cat) => cat).join(", ")}{" "}
            </p>
          )}{" "}
        </div>{" "}
        <Title className="text-sm line-clamp-1 min-h-5">
          {" "}
          {product?.title}{" "}
        </Title>{" "}
        <div className="flex items-center gap-2">
          {" "}
          <div className="flex items-center gap-0.5">
            {" "}
            {[...Array(5)].map((_, index) => (
              <StarIcon
                size={12}
                key={index}
                className={
                  index < 4
                    ? "text-shop-lighter-green"
                    : "text-shop-lighter-text"
                }
                fill={index < 4 ? "#93d991" : "#ababab"}
              />
            ))}{" "}
          </div>{" "}
          <p className="shop-light-text text-xs tracking-wide">
            {" "}
            5 Reviews{" "}
          </p>{" "}
        </div>{" "}
        <div className="flex items-center gap-2.5 min-h-5">
          {" "}
          {(product?.stock as number) > 0 ? (
            <>
              {" "}
              <p className="font-medium">In Stock</p>{" "}
              <p className="text-shop-light-green/80 font-semibold">
                {" "}
                {product?.stock}{" "}
              </p>{" "}
            </>
          ) : (
            <p className="text-red-600 font-semibold"> Out of Stock </p>
          )}{" "}
        </div>{" "}
        <div className="min-h-12">
          {" "}
          <PriceView price={product.price} discount={product.discount} />{" "}
        </div>{" "}
        <AddToCartButton
          product={product}
          className="w-full md:w-36 rounded-md mt-auto"
        />{" "}
      </div>{" "}
    </div>
  );
};
export default ProductCard;
