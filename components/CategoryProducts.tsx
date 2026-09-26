"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Category, Product } from "@/sanity.types";
import { client } from "@/sanity/lib/client";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";
import { Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import NoProductAvailable from "./NoProductAvailable";

interface Props {
  categories: Category[];
  slug: string;
}
const CategoryProducts = ({ categories, slug }: Props) => {
  const [currentSlug, setCurrentSlug] = useState(slug);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCategoryChange = (newSlug: string) => {
    if (newSlug === currentSlug) return;
    setCurrentSlug(newSlug);
    router.push(`/category/${newSlug}`, { scroll: false });
  };

  const fetchProducts = async (categorySlug: string) => {
    setLoading(true);
    try {
      const query = `*[_type=="product" && references(*[_type == "category" && slug.current == 
      $categorySlug]._id)] | order(title asc){
      ...,"categories": categories[]->title}
      `;
      const data = await client.fetch(query, { categorySlug });
      setProducts(data);
    } catch (error) {
      console.error("error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProducts(currentSlug);
  }, [currentSlug]);

  return (
    <div className="py-6 flex flex-col md:flex-row items-start gap-6 lg:gap-8">
      {/* Category Navigation Sidebar */}
      <div className="w-full md:w-56 shrink-0 bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible md:max-h-[calc(100vh-200px)] md:overflow-y-auto scrollbar-hide md:sticky md:top-24">
        {categories?.map((item) => {
          const isActive = item?.slug?.current === currentSlug;
          return (
            <button
              type="button"
              onClick={() => handleCategoryChange(item?.slug?.current as string)}
              key={item?._id}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 whitespace-nowrap md:whitespace-normal cursor-pointer ${
                isActive
                  ? "bg-shop-dark-green text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item?.title}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="flex-1 w-full min-w-0">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-100 bg-white p-3.5 sm:p-4 flex flex-col gap-3 animate-pulse shadow-xs"
              >
                <div className="w-full aspect-square rounded-xl bg-slate-100" />
                <div className="h-3 w-1/3 rounded bg-slate-100" />
                <div className="h-4 w-4/5 rounded bg-slate-100" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
                <div className="h-9 w-full rounded-xl bg-slate-100 mt-2" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {products.map((product: Product) => (
              <AnimatePresence key={product._id}>
                <motion.div
                  layout
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <ProductCard key={product._id} product={product} />
                </motion.div>
              </AnimatePresence>
            ))}
          </div>
        ) : (
          <NoProductAvailable selectedTab={currentSlug} className="mt-0 w-full" />
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
