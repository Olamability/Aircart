"use client";
import type {
  internalGroqTypeReferenceTo,
  SanityImageCrop,
  SanityImageHotspot,
} from "@/sanity.types";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
interface Props {
  images?: Array<{
    asset?: {
      _ref: string;
      _type: "reference";
      _weak?: boolean;
      [internalGroqTypeReferenceTo]?: "sanity.imageAsset";
    };
    hotspot?: SanityImageHotspot;
    crop?: SanityImageCrop;
    _type: "image";
    _key: string;
  }>;
  isStock?: number;
}
const ImageView = ({ images = [], isStock }: Props) => {
  const [active, setActive] = useState(0);
  if (!images.length) {
    return null;
  }
  const activeImage = images[active];
  if (!activeImage?.asset?._ref) {
    return null;
  }
  const imageUrl = urlFor(activeImage).url();
  return (
    <div className="w-full space-y-2 md:space-y-4">
      {" "}
      {/* Main image */}{" "}
      <div className="group relative w-full overflow-hidden">
        {" "}
        <AnimatePresence mode="wait" initial={false}>
          {" "}
          <motion.div
            key={activeImage._key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full min-h-112.5 overflow-hidden rounded-md border border-darkColor/10"
          >
            {" "}
            <Image
              src={imageUrl}
              alt="Product image"
              width={700}
              height={700}
              priority
              className={`w-full h-125 max-h-137 object-contain rounded-md hoverEffect group-hover:scale-110 ${isStock === 0 ? "opacity-50" : ""}`}
            />{" "}
          </motion.div>{" "}
        </AnimatePresence>{" "}
        {/* Previous */}{" "}
        {active > 0 && (
          <button
            type="button"
            onClick={() => setActive((prev) => prev - 1)}
            aria-label="Previous product image"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-shop-dark-green hover:bg-shop-orange hover:text-white transition-colors"
          >
            {" "}
            &lt;{" "}
          </button>
        )}{" "}
        {/* Next */}{" "}
        {active < images.length - 1 && (
          <button
            type="button"
            onClick={() => setActive((prev) => prev + 1)}
            aria-label="Next product image"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-shop-dark-green hover:bg-shop-orange hover:text-white transition-colors"
          >
            {" "}
            &gt;{" "}
          </button>
        )}{" "}
      </div>{" "}
      {/* Thumbnails */}{" "}
      <div className="flex gap-2 overflow-x-auto">
        {" "}
        {images.map((image, index) => {
          if (!image.asset?._ref) {
            return null;
          }
          return (
            <button
              key={image._key}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View product image ${index + 1}`}
              className={`shrink-0 w-20 h-20 rounded-md border p-1 bg-white transition-all ${active === index ? "border-shop-orange" : "border-gray-200 hover:border-shop-orange/50"}`}
            >
              {" "}
              <Image
                src={urlFor(image).url()}
                alt={`Product image ${index + 1}`}
                width={100}
                height={100}
                className="w-full h-full object-contain rounded"
              />{" "}
            </button>
          );
        })}{" "}
      </div>{" "}
    </div>
  );
};
export default ImageView;
