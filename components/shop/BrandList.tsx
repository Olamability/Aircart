import React from "react";
import type { BRAND_QUERY_RESULT } from "@/sanity.types";
import { Title } from "../text";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

interface Props {
  brands: BRAND_QUERY_RESULT;
  selectedBrand?: string | null;
  setSelectedBrand: React.Dispatch<React.SetStateAction<string | null>>;
}

const BrandList = ({ brands, selectedBrand, setSelectedBrand }: Props) => {
  return (
    <div className="w-full p-5">
      <Title className="text-base font-black">Brands</Title>

      <RadioGroup
        value={selectedBrand || ""}
        onValueChange={(value) => setSelectedBrand(value)}
        className="mt-2 space-y-2"
      >
        {brands?.map((brand) => (
          <div
            key={brand?._id}
            className="flex items-center space-x-2 hover:cursor-pointer"
          >
            <RadioGroupItem
              value={brand?.slug?.current || ""}
              id={brand?.slug?.current || brand?._id}
              className="rounded-sm"
            />

            <Label
              htmlFor={brand?.slug?.current || brand?._id}
              className={`cursor-pointer ${
                selectedBrand === brand?.slug?.current
                  ? "font-semibold text-shop-dark-green"
                  : "font-normal"
              }`}
            >
              {brand?.title}
            </Label>
          </div>
        ))}

        {selectedBrand && (
          <button
            type="button"
            onClick={() => setSelectedBrand(null)}
            className="text-sm font-medium mt-2 underline underline-offset-2 decoration-[1px] hover:text-shop-dark-green hoverEffect"
          >
            Reset Selection
          </button>
        )}
      </RadioGroup>
    </div>
  );
};

export default BrandList;
