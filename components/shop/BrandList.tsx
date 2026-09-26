import React from "react";
import type { BRAND_QUERY_RESULT } from "@/sanity.types";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

interface Props {
  brands: BRAND_QUERY_RESULT;
  selectedBrand?: string | null;
  setSelectedBrand: React.Dispatch<React.SetStateAction<string | null>>;
}

const BrandList = ({ brands, selectedBrand, setSelectedBrand }: Props) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Brands
        </h3>
        {selectedBrand && (
          <button
            type="button"
            onClick={() => setSelectedBrand(null)}
            className="text-[11px] font-semibold text-shop-dark-green hover:underline cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      <RadioGroup
        value={selectedBrand || ""}
        onValueChange={(value) => setSelectedBrand(value)}
        className="space-y-1 max-h-56 overflow-y-auto pr-1 scrollbar-hide"
      >
        {brands?.map((brand) => {
          const isSelected = selectedBrand === brand?.slug?.current;
          return (
            <div
              key={brand?._id}
              onClick={() => setSelectedBrand(brand?.slug?.current || null)}
              className={`flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition-colors duration-150 ${
                isSelected
                  ? "bg-emerald-50 text-shop-dark-green font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <RadioGroupItem
                  value={brand?.slug?.current || ""}
                  id={brand?.slug?.current || brand?._id}
                  className="size-3.5 border-slate-300 data-checked:border-shop-dark-green data-checked:bg-shop-dark-green"
                />

                <Label
                  htmlFor={brand?.slug?.current || brand?._id}
                  className="text-xs sm:text-sm cursor-pointer truncate font-inherit"
                >
                  {brand?.title}
                </Label>
              </div>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};

export default BrandList;
