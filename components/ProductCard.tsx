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
    <div className=" text-sm border-[1px] border-dark-blue/50 rounde-md bg-white group">
      <div className="relative group overflow-hidden bg-shop-light-bg">
        {product?.image && (
          <Link href={`/product/${product?.slug?.current}`}>
            <Image
              src={urlFor(product?.image?.[0]).url()}
              alt="ProductImage"
              loading="lazy"
              width={500}
              height={500}
              className={`w-full h-64 object-contain overflow-hidden
          transition-transform bg-shop-light-bg hoverEffect
          ${product?.stock !== 0 ? "group-hover:scale-105" : "opacity-50"}`}
            />
          </Link>
        )}
        <FavoriteIcon product={product} />
        {product?.status === "new" && (
          <p
            className="absolute top-2 left-2 z-10 text-sm border 
        border-darkColor/50 px-2 rounded-full 
        group-hover:border-shop-light-green 
        group-hover:text-shop-light-green hoverEffect"
          >
            New Arrival
          </p>
        )}

        {product?.status === "available" && (
          <p
            className="absolute top-2 left-2 z-10 text-sm border 
        border-darkColor/50 px-2 rounded-full 
        group-hover:border-shop-light-green 
        group-hover:text-shop-light-green hoverEffect"
          >
            Available
          </p>
        )}

        {product?.status === "hot" && (
          <Link
            href={"/deal"}
            className="absolute top-2 left-2 z-10 text-sm border 
        border-shop-orange/50 p-1 rounded-full 
        group-hover:border-shop-orange 
        group-hover:text-shop-dark-green hoverEffect"
          >
            <Flame
              size={18}
              fill="#fb6c08"
              className="text-shop-orange/50 group-hover:text-shop-orange hoverEffect"
            />
          </Link>
        )}
      </div>
      <div className="p-3 flex flex-col gap-2">
        {product?.categories && (
          <p className="uppercase text-xs line-clamp-1 text-shop-light-text">
            {product.categories.map((cat) => cat).join(", ")}
          </p>
        )}
        <Title className="text-sm line-clamp-1">{product?.title}</Title>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
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
            ))}
          </div>
          <p className="shop-light-text text-xs tracking-wide">5 Reviews</p>
        </div>
        <div className="flex items-center gap-2.5">
          <p className="font-medium">In Stock</p>
          <p
            className={`${product?.stock === 0
                ? "text-red-600"
                : "text-shop-light-green/80 font-semibold"
              }`}
          >
            {(product?.stock as number) > 0 ? product?.stock : "Out of Stock"}
          </p>
        </div>
        <PriceView price={product.price} discount={product.discount} />
        <AddToCartButton product={product} className="w-36 rounded-md" />
      </div>
    </div>
  );
};

export default ProductCard;
