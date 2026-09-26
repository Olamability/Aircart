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
import { ChevronLeft, ChevronRight, Package } from "lucide-react";

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
    return (
      <div className="w-full aspect-square max-h-[520px] rounded-2xl border border-slate-200/80 bg-slate-50/60 flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <Package className="w-16 h-16 stroke-1 text-slate-300 mb-2" />
        <p className="text-sm font-medium">No product image available</p>
      </div>
    );
  }

  const activeImage = images[active];
  if (!activeImage?.asset?._ref) {
    return (
      <div className="w-full aspect-square max-h-[520px] rounded-2xl border border-slate-200/80 bg-slate-50/60 flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <Package className="w-16 h-16 stroke-1 text-slate-300 mb-2" />
        <p className="text-sm font-medium">No product image available</p>
      </div>
    );
  }

  const imageUrl = urlFor(activeImage).url();

  return (
    <div className="w-full flex flex-col gap-3 sm:gap-4">
      {/* Main hero image stage */}
      <div className="group relative w-full aspect-square max-h-[520px] rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50/90 via-slate-50/50 to-slate-100/60 p-4 sm:p-8 flex items-center justify-center overflow-hidden shadow-xs">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeImage._key || active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative w-full h-full flex items-center justify-center"
          >
            <Image
              src={imageUrl}
              alt="Product preview"
              width={700}
              height={700}
              priority
              className={`w-full h-full object-contain object-center transition-transform duration-500 ease-out group-hover:scale-105 ${
                isStock === 0 ? "opacity-40 grayscale-[20%]" : ""
              }`}
            />
          </motion.div>
        </AnimatePresence>

        {/* Carousel controls if multiple images */}
        {images.length > 1 && (
          <>
            {active > 0 && (
              <button
                type="button"
                onClick={() => setActive((prev) => prev - 1)}
                aria-label="Previous product image"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 backdrop-blur-xs border border-slate-200/80 shadow-md flex items-center justify-center text-slate-700 hover:text-shop-dark-green hover:scale-105 active:scale-95 transition-all duration-200 z-10 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {active < images.length - 1 && (
              <button
                type="button"
                onClick={() => setActive((prev) => prev + 1)}
                aria-label="Next product image"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 backdrop-blur-xs border border-slate-200/80 shadow-md flex items-center justify-center text-slate-700 hover:text-shop-dark-green hover:scale-105 active:scale-95 transition-all duration-200 z-10 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Counter badge */}
            <div className="absolute bottom-3.5 right-3.5 px-2.5 py-1 rounded-full bg-slate-900/60 backdrop-blur-xs text-[11px] font-medium text-white pointer-events-none">
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails strip */}
      {images.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {images.map((image, index) => {
            if (!image.asset?._ref) {
              return null;
            }
            const isSelected = active === index;
            return (
              <button
                key={image._key || index}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`View product image ${index + 1}`}
                className={`relative shrink-0 w-18 h-18 sm:w-20 sm:h-20 rounded-xl border p-1.5 bg-white transition-all duration-200 cursor-pointer overflow-hidden ${
                  isSelected
                    ? "border-shop-dark-green ring-2 ring-shop-dark-green/20 shadow-xs"
                    : "border-slate-200/80 hover:border-slate-300 opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={urlFor(image).url()}
                  alt={`Thumbnail ${index + 1}`}
                  width={100}
                  height={100}
                  className="w-full h-full object-contain rounded-lg"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImageView;
