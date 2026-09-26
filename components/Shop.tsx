"use client";

import { useState, useEffect } from "react";
import { Category } from "@/sanity.types";
import { BRAND_QUERY_RESULT } from "@/sanity.types";
import Container from "@/components/Container";
import CategoryList from "./shop/CategoryList";
import BrandList from "./shop/BrandList";
import { Product } from "@/sanity.types";
import { useSearchParams } from "next/navigation";
import PriceList from "./shop/PriceList";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import NoProductAvailable from "./NoProductAvailable";
import { client } from "@/sanity/lib/client";
import ProductCard from "./ProductCard";

interface Props {
  categories: Category[];
  brands: BRAND_QUERY_RESULT;
}

const Shop = ({ categories, brands }: Props) => {
  const searchParams = useSearchParams();
  const brandParams = searchParams.get("brand");
  const categoryParams = searchParams.get("category");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categoryParams || null,
  );
  const categorySlug = selectedCategory?.toLowerCase() || null;

  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    brandParams || null,
  );
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);

  const activeFilterCount = [selectedCategory, selectedBrand, selectedPrice].filter(
    Boolean,
  ).length;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let minPrice: number | null = null;
      let maxPrice: number | null = null;

      if (selectedPrice) {
        if (selectedPrice.endsWith("+")) {
          minPrice = Number(selectedPrice.replace("+", ""));
        } else {
          const [min, max] = selectedPrice.split("-").map(Number);
          minPrice = min;
          maxPrice = max;
        }
      }
      const query = `*[
  _type == "product"

  && (
    !defined($selectedCategory)
    || references(
      *[
        _type == "category"
        && slug.current == $selectedCategory
      ]._id
    )
  )

  && (
    !defined($selectedBrand)
    || references(
      *[
        _type == "brand"
        && slug.current == $selectedBrand
      ]._id
    )
  )

  && (
    !defined($minPrice)
    || price >= $minPrice
  )

  && (
    !defined($maxPrice)
    || price <= $maxPrice
  )
]
| order(title asc) {
  ...,
  "categories": categories[]->title
}`;

      const data = await client.fetch(
        query,
        { selectedCategory: categorySlug, selectedBrand, minPrice, maxPrice },
        { next: { revalidate: 0 } },
      );
      setProducts(data);
    } catch (error) {
      console.log("Shop product fetching Error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedBrand, selectedPrice]);

  return (
    <div className="w-full bg-slate-50/40 min-h-screen pb-16">
      <Container className="pt-6 sm:pt-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Marketplace Catalog
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Browse our curated collection of verified products
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-shop-dark-green text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
              {showMobileFilters ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* Clear All Filters */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedBrand(null);
                  setSelectedPrice(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset ({activeFilterCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 pb-1">
            <span className="text-xs font-medium text-slate-400">Active:</span>

            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span>Category: {selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="hover:text-emerald-950 cursor-pointer"
                  aria-label="Remove category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedBrand && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span>Brand: {selectedBrand}</span>
                <button
                  type="button"
                  onClick={() => setSelectedBrand(null)}
                  className="hover:text-emerald-950 cursor-pointer"
                  aria-label="Remove brand filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedPrice && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span>Price: ₦{selectedPrice}</span>
                <button
                  type="button"
                  onClick={() => setSelectedPrice(null)}
                  className="hover:text-emerald-950 cursor-pointer"
                  aria-label="Remove price filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start pt-6">
          {/* Filter Sidebar - Desktop & Collapsible Mobile */}
          <aside
            className={`w-full lg:w-64 shrink-0 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs lg:sticky lg:top-24 space-y-6 ${
              showMobileFilters ? "block" : "hidden lg:block"
            }`}
          >
            <CategoryList
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
            <BrandList
              brands={brands}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
            />
            <PriceList
              setSelectedPrice={setSelectedPrice}
              selectedPrice={selectedPrice}
            />
          </aside>

          {/* Product Grid Area */}
          <main className="flex-1 w-full min-w-0">
            {/* Status bar */}
            <div className="flex items-center justify-between mb-4 text-xs text-slate-500 font-medium">
              <span>
                {loading ? "Searching products..." : `${products.length} products available`}
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {[...Array(8)].map((_, i) => (
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
            ) : products?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {products?.map((product) => (
                  <ProductCard key={product?._id} product={product} />
                ))}
              </div>
            ) : (
              <NoProductAvailable className="bg-white mt-0" />
            )}
          </main>
        </div>
      </Container>
    </div>
  );
};

export default Shop;
