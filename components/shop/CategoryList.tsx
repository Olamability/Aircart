import { Category } from "@/sanity.types";
import React from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

interface Props {
  categories: Category[];
  selectedCategory?: string | null;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string | null>>;
}

const CategoryList = ({
  categories,
  selectedCategory,
  setSelectedCategory,
}: Props) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Categories
        </h3>
        {selectedCategory && (
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className="text-[11px] font-semibold text-shop-dark-green hover:underline cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      <RadioGroup
        value={selectedCategory || ""}
        className="space-y-1 max-h-56 overflow-y-auto pr-1 scrollbar-hide"
      >
        {categories?.map((category) => {
          const isSelected = selectedCategory === category?.slug?.current;
          return (
            <div
              onClick={() => {
                setSelectedCategory(category?.slug?.current as string);
              }}
              key={category?._id}
              className={`flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition-colors duration-150 ${
                isSelected
                  ? "bg-emerald-50 text-shop-dark-green font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <RadioGroupItem
                  value={category?.slug?.current as string}
                  id={category?.slug?.current}
                  className="size-3.5 border-slate-300 data-checked:border-shop-dark-green data-checked:bg-shop-dark-green"
                />
                <Label
                  htmlFor={category?.slug?.current}
                  className="text-xs sm:text-sm cursor-pointer truncate font-inherit"
                >
                  {category?.title}
                </Label>
              </div>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};

export default CategoryList;
