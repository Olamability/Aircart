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

  return (
    <Accordion type="single">
      <AccordionItem value="item-1">
        <AccordionTrigger className="justify-start text-left">
          Characteristics
        </AccordionTrigger>

        <AccordionContent>
          <div className="space-y-3">
            {/* Brand */}
            <p className="flex items-center justify-between gap-5">
              <span>Brand:</span>

              <span className="font-semibold tracking-wide">
                {brand?.title || "N/A"}
              </span>
            </p>

            {/* Collection */}
            <p className="flex items-center justify-between gap-5">
              <span>Collection:</span>

              <span className="font-semibold tracking-wide">2025</span>
            </p>

            {/* Type */}
            <p className="flex items-center justify-between gap-5">
              <span>Type:</span>

              <span className="font-semibold tracking-wide">
                {product?.variant || "N/A"}
              </span>
            </p>

            {/* Stock */}
            <p className="flex items-center justify-between gap-5">
              <span>Stock:</span>

              <span
                className={
                  product?.stock
                    ? "font-semibold tracking-wide text-shop-light-green"
                    : "font-semibold tracking-wide text-red-600"
                }
              >
                {product?.stock ? "Available" : "Out of Stock"}
              </span>
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ProductCharacteristics;
