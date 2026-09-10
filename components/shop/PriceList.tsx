import React from "react";
import { Title } from "../text";
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
    <div className="w-full p-5">
      <Title className="text-base font-black">Price</Title>

      <RadioGroup
        value={selectedPrice || ""}
        onValueChange={(value) => setSelectedPrice?.(value)}
        className="mt-2 space-y-2"
      >
        {priceArray.map((price) => (
          <div
            key={price?.value}
            className="flex items-center space-x-2 hover:cursor-pointer"
          >
            <RadioGroupItem
              value={price?.value}
              id={price?.value}
              className="rounded-sm"
            />

            <Label
              htmlFor={price?.value}
              className={`cursor-pointer ${
                selectedPrice === price?.value
                  ? "font-semibold text-shop-dark-green"
                  : "font-normal"
              }`}
            >
              {price?.title}
            </Label>
          </div>
        ))}

        {selectedPrice && (
          <button
            type="button"
            onClick={() => setSelectedPrice?.(null)}
            className="text-sm font-medium mt-2 underline underline-offset-2 decoration-[1px] hover:text-shop-dark-green hoverEffect"
          >
            Reset Selection
          </button>
        )}
      </RadioGroup>
    </div>
  );
};

export default PriceList;
