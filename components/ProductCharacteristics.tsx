import React from "react";
import { Product } from "@/sanity.types";
import { getBrandQ } from "@/sanity/queries";
import {
  AccordionContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const ProductCharacteristics = async ({
  product,
}: {
  product: Product | null | undefined;
}) => {
  const brand = product?.slug?.current
    ? await getBrandQ(product.slug.current)
    : [];

  const isAvailable = (product?.stock as number) > 0;

  return (
    <div className="w-full border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-2xs">
      <Accordion className="w-full">
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="px-4 py-3.5 hover:no-underline font-semibold text-sm text-slate-900 flex justify-between items-center w-full">
            <span>Product Specifications</span>
          </AccordionTrigger>

          <AccordionContent className="px-4 pb-4 pt-1">
            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              {/* Brand */}
              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-500">Brand</span>
                <span className="font-semibold text-slate-800 tracking-tight">
                  {brand?.title || "Airmart Marketplace"}
                </span>
              </div>

              {/* Collection */}
              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-500">Collection</span>
                <span className="font-semibold text-slate-800">2025 Series</span>
              </div>

              {/* Type / Variant */}
              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-500">Variant / Edition</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {product?.variant || "Standard"}
                </span>
              </div>

              {/* Stock */}
              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-500">Inventory Status</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isAvailable
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                      : "bg-rose-50 text-rose-700 border border-rose-200/70"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isAvailable ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                  {isAvailable ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ProductCharacteristics;
