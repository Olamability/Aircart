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
    <div className="py-5 flex flex-col md:flex-row items-start gap-5">
      <div className="flex md:flex-col gap-2 md:min-w-40 border overflow-x-auto md:overflow-x-visible md:max-h-[500px] md:overflow-y-auto">
        {categories?.map((item) => (
          <Button
            onClick={() => handleCategoryChange(item?.slug?.current as string)}
            key={item?._id}
            className={`bg-transparent border-1 border-shop-btn-dark-green/30 p-0 rounded-none 
            text-darkColor shadow-none hover:bg-shop-orange 
            hover:text-white font-semibold hoverEffect 
            border-b last:border-b-0 transition-colors capitalize 
            ${item?.slug?.current === currentSlug && "bg-shop-orange text-white border-shop-orange"}`}
          >
            <p className="w-full text-left px-2">{item?.title}</p>
          </Button>
        ))}
      </div>
      <div className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 min-h-80 space-y-4 text-center        bg-gray-100 rounded-lg w-full">
            <div
              className="flex items-center space-x-2
          text-blue-600"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Product is loading...</span>
            </div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {products.map((product: Product) => (
              <AnimatePresence key={product._id}>
                <motion.div>
                  <ProductCard key={product._id} product={product} />
                </motion.div>
              </AnimatePresence>
            ))}
          </div>
        ) : (
          <NoProductAvailable
            selectedTab={currentSlug}
            className="mt-0 w-full"
          />
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
