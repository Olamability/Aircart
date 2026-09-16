"use client";
import NoProductAvailable from "./NoProductAvailable";
import { useEffect, useState } from "react";
import HomeTabBar from "@/components/HomeTabBar";
import { productType } from "@/constants/data";
import { client } from "@/sanity/lib/client";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import ProductCard from "./ProductCard";

const ProductGrid = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(productType[0]?.title || "");

  const query = `*[_type == "product" && variant == $variant]
| order(title desc) {
  ...,
  "categories": categories[]->title
}`;
  const params = { variant: selectedTab.toLowerCase() };
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await (client as any).fetch(query, params);
        setProducts(response);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedTab]);
  return (
    <div>
      <HomeTabBar selectedTab={selectedTab} onTabSelect={setSelectedTab} />
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 min-h-80 gap-4 bg-gray-100 w-full mt-10">
          <div className="space-x-2 flex items-center text-blue-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Product is Loading...</span>
          </div>
        </div>
      ) : products?.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-10">
          {products?.map((product) => (
            <AnimatePresence key={product?._id}>
              <motion.div
                layout
                initial={{ opacity: 0.2 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ProductCard product={product} />
              </motion.div>
            </AnimatePresence>
          ))}
        </div>
      ) : (
        <NoProductAvailable selectedTab={selectedTab} className="mt-10" />
      )}
    </div>
  );
};

export default ProductGrid;
