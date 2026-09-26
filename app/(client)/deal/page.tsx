import React from "react";
import { getDealProduct } from "@/sanity/queries";
import Container from "@/components/Container";
import { FlameIcon } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/sanity.types";

const DealPage = async () => {
  const products = await getDealProduct();
  return (
    <div className="py-8 sm:py-12 bg-slate-50/50 min-h-[60vh]">
      <Container>
        <div className="mb-6 sm:mb-8 pb-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100 mb-2">
              <FlameIcon className="w-3.5 h-3.5 fill-red-500 text-red-500 animate-pulse" />
              <span>Limited Time</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              Hot Deals of the Week
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Curated flash sales and limited-time savings across premium products.
            </p>
          </div>
          {products && products.length > 0 && (
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Showing <span className="font-semibold text-slate-800">{products.length}</span> {products.length === 1 ? "deal" : "deals"}
            </p>
          )}
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
            {products.map((product) => (
              <ProductCard key={product?._id} product={product as unknown as Product} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/70 p-8 shadow-xs">
            <FlameIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h2 className="text-base font-semibold text-slate-800">No active deals right now</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Check back soon for fresh promotions and discounts on your favorite items.
            </p>
          </div>
        )}
      </Container>
    </div>
  );
};

export default DealPage;
