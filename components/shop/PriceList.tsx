import React from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

const priceArray = [
  { title: "Under ₦100", value: "0-100" },
  { title: "₦200 - ₦300", value: "200-300" },
  { title: "₦300 - ₦500", value: "300-500" },
  { title: "Over ₦500", value: "500+" },
];

interface Props {
  selectedPrice?: string | null;
  setSelectedPrice?: React.Dispatch<React.SetStateAction<string | null>>;
}

const PriceList = ({ selectedPrice, setSelectedPrice }: Props) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Price Range
        </h3>
        {selectedPrice && (
          <button
            type="button"
            onClick={() => setSelectedPrice?.(null)}
            className="text-[11px] font-semibold text-shop-dark-green hover:underline cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      <RadioGroup
        value={selectedPrice || ""}
        onValueChange={(value) => setSelectedPrice?.(value)}
        className="space-y-1"
      >
        {priceArray.map((price) => {
          const isSelected = selectedPrice === price?.value;
          return (
            <div
              key={price?.value}
              onClick={() => setSelectedPrice?.(price?.value)}
              className={`flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition-colors duration-150 ${
                isSelected
                  ? "bg-emerald-50 text-shop-dark-green font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <RadioGroupItem
                  value={price?.value}
                  id={price?.value}
                  className="size-3.5 border-slate-300 data-checked:border-shop-dark-green data-checked:bg-shop-dark-green"
                />

                <Label
                  htmlFor={price?.value}
                  className="text-xs sm:text-sm cursor-pointer truncate font-inherit"
                >
                  {price?.title}
                </Label>
              </div>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};

export default PriceList;
