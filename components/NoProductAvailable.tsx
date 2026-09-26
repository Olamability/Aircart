"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { PackageOpen } from "lucide-react";

interface Props {
  selectedTab?: string;
  className?: string;
}

const NoProductAvailable = ({ selectedTab, className }: Props) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 min-h-72 rounded-2xl border border-slate-200/70 bg-slate-50/60 text-center w-full",
        className,
      )}
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
        <PackageOpen className="w-6 h-6 stroke-1.5" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900">
        {selectedTab
          ? `No products found in "${selectedTab}"`
          : "No products match your criteria"}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1.5 leading-relaxed">
        We couldn&apos;t find any items matching your selected criteria. Try adjusting or clearing your filters to explore our full catalog.
      </p>
    </div>
  );
};

export default NoProductAvailable;