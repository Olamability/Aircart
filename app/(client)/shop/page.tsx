import { getCategories } from "@/sanity/queries";
import { getBrands } from "@/sanity/queries";
import Shop from "@/components/Shop";
import React from "react";

const ShopPage = async () => {
  const categories = await getCategories();
  const brands = await getBrands();
  return (
    <div>
      <Shop
        categories={Array.isArray(categories) ? categories : []}
        brands={Array.isArray(brands) ? brands : []}
      />
    </div>
  );
};

export default ShopPage;
