import React from "react";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/sanity/queries";
import type { Product } from "@/sanity.types";
import { Title } from "@/components/text";
import PriceView from "@/components/PriceView";
import AddToCartButton from "@/components/AddToCartButton";
import FavoriteIcon from "@/components/FavoriteIcon";
import Container from "@/components/Container";
import ImageView from "@/components/ImageView";
import { StarIcon, RotateCcw } from "lucide-react";
import ProductCharacteristics from "@/components/ProductCharacteristics";
import { FaRegQuestionCircle } from "react-icons/fa";
import { RxBorderSplit } from "react-icons/rx";
import { TbTruckDelivery } from "react-icons/tb";
import { FiShare2 } from "react-icons/fi";

const SingleProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <Container className="flex flex-col md:flex-row gap-5 pb-10 pt-5">
      {/* Product image */}
      <div className="w-full md:w-1/2 relative bg-shop-light-bg rounded-lg overflow-hidden">
        <ImageView images={product.image} isStock={product.stock} />
        {/* <FavoriteIcon product={product} /> */}
      </div>

      {/* Product details */}
      <div className="w-full md:w-1/2 flex flex-col gap-5">
        {product?.categories && (
          <h2 className="text-xs uppercase tracking-wide text-shop-light-text">
            {product?.categories.map((category) => category.title).join(", ")}
          </h2>
        )}
        <Title className="text-2xl md:text-3xl font-bold">
          {product?.title}
        </Title>
        {product?.description && (
          <div>
            <p className="text-sm leading-1 text-shop-light-text">
              {product?.description}
            </p>
            <div className="flex items-center gap-0.5 text-xs pt-5">
              {[...Array(5)].map((_, index) => (
                <StarIcon
                  key={index}
                  size={12}
                  className="text-shop-light-green"
                  fill={"#3b9c3c"}
                />
              ))}
              <p className="font-semibold">(`(120)`)</p>
            </div>
          </div>
        )}
        <div className="flex items-center border-t border-b border-gray-200 py-5 gap-2">
          <span className="font-semibold text-red-600 shrink-0">Price:</span>

          <PriceView price={product?.price} discount={product?.discount} />
        </div>
        <div className="flex items-center gap-2">
          <p
            className={`px-4 py-1.5 text-sm text-center font-semibold rounde-lg ${product?.stock === 0 ? "bg-red-100 text-red-600" : "text-green-600 bg-green-100"}`}
          >
            {(product?.stock as number) > 0 ? "In stock" : "Out of Stock"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AddToCartButton
            product={product as unknown as Product}
            className="w-full sm:w-72 rounded-md"
          />

          <FavoriteIcon
            product={product as unknown as Product}
            className="static"
          />
        </div>
        <ProductCharacteristics product={product as unknown as Product} />
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-b-gray-200 py-5 -mt-2">
          <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
            <RxBorderSplit className="text-lg" />
            <p>Compare color</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
            <FaRegQuestionCircle className="text-lg" />
            <p>Ask a question</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
            <TbTruckDelivery className="text-lg" />
            <p>Delivery & Return</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
            <FiShare2 className="text-lg" />
            <p>Share</p>
          </div>
        </div>

        <div className="border border-gray-300 gap-2.5">
          <div className="flex items-center border border-gray-300 px-3 gap-2.5 py-2">
            <div className=" ">
              <TbTruckDelivery className="w-5 h-5 text-lg text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-darkColor">
                Free Delievery
              </h3>
              <p className="text-xs">
                Enter your postal code for Delivery Accesibiity
              </p>
            </div>
          </div>
          {/* next */}
          <div className="flex items-center border border-gray-300 px-3 gap-2.5 py-2">
            <div className=" ">
              <RotateCcw className="w-5 h-5 text-lg text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-darkColor">
                Return Delievery
              </h3>
              <p className="text-xs">Free 30days Delivery Return Deals</p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default SingleProductPage;
