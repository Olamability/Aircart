import Link from "next/link";
import { productType } from "@/constants/data";
import { Title } from "./text";
import { ArrowRight } from "lucide-react";

interface Props {
  selectedTab: string;
  onTabSelect: (tab: string) => void;
}

const HomeTabBar = ({ selectedTab, onTabSelect }: Props) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
      {/* Mobile Top Row */}
      <div className="flex items-center justify-between md:hidden">
        <Title className="text-xl font-bold">Categories</Title>
        <Link
          href={"/shop"}
          className="flex items-center gap-1 text-sm font-semibold text-shop-dark-green hover:text-shop-light-green hoverEffect"
        >
          See all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Categories Row */}
      <div className="flex items-center gap-3 text-sm font-semibold overflow-x-auto scrollbar-hide pb-2 md:pb-0 w-full md:w-auto">
        {productType?.map((item) => (
          <button
            key={item?.title}
            onClick={() => onTabSelect(item.title)}
            className={`border border-shop-light-green/20 px-5 py-2
        md:px-6 md:py-2 rounded-full hover:bg-shop-light-green shrink-0 whitespace-nowrap
      hover:border-shop-light-green hover:text-white hoverEffect transition-all duration-300
      ${
        selectedTab === item?.title
          ? "bg-shop-light-green text-white border-shop-light-green shadow-sm md:shadow-none"
          : "bg-shop-light-green/10 md:bg-shop-light-green/20 text-shop-dark-green md:text-black hover:text-white"
      }`}
          >
            {item?.title}
          </button>
        ))}
      </div>
      
      {/* Desktop See All */}
      <Link
        href={"/shop"}
        className="hidden md:inline-flex border border-shop-light-green/30 px-6 py-2 rounded-full hover:bg-shop-light-green hover:border-shop-light-green hover:text-white hoverEffect"
      >
        See all
      </Link>
    </div>
  );
};

export default HomeTabBar;
