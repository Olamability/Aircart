import Link from "next/link";
import { productType } from "@/constants/data";
import { ArrowRight } from "lucide-react";

interface Props {
  selectedTab: string;
  onTabSelect: (tab: string) => void;
}

const HomeTabBar = ({ selectedTab, onTabSelect }: Props) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      {/* Mobile Top Row */}
      <div className="flex items-center justify-between sm:hidden">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Categories</h2>
        <Link
          href={"/shop"}
          className="inline-flex items-center gap-1 text-xs font-semibold text-shop-dark-green hover:text-shop-light-green transition-colors"
        >
          <span>See all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Categories Row */}
      <div className="flex items-center gap-2 text-sm font-semibold overflow-x-auto scrollbar-hide py-1 w-full sm:w-auto">
        {productType?.map((item) => {
          const isActive = selectedTab === item?.title;
          return (
            <button
              key={item?.title}
              onClick={() => onTabSelect(item.title)}
              className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold shrink-0 whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-shop-dark-green text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60"
              }`}
            >
              {item?.title}
            </button>
          );
        })}
      </div>

      {/* Desktop See All */}
      <Link
        href={"/shop"}
        className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-shop-dark-green hover:text-shop-light-green transition-colors px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50"
      >
        <span>See all products</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};

export default HomeTabBar;
