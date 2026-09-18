"use client";
import { Search, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { client } from "@/sanity/lib/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

type SearchProduct = {
  _id: string;
  title: string;
  slug?: { current?: string };
  price?: number;
  image?: Parameters<typeof urlFor>[0];
  category?: string[];
};

const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (open && products.length === 0) {
      client
        .fetch(
          `*[_type == "product"] { _id, title, slug, price, "image": image[0], "category": categories[]->title }`,
        )
        .then((res) => {
          setProducts(res);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching search products:", error);
          setLoading(false);
        });
    }
  }, [open, products.length]);
  useEffect(() => {
    if (!open || typeof window === "undefined") {
      return;
    }
    const viewport = window.visualViewport;
    if (!viewport) {
      return;
    }
    const handleViewportChange = () => {
      const keyboardHeight = window.innerHeight - viewport.height;
      setKeyboardOpen(keyboardHeight > 120);
    };
    handleViewportChange();
    viewport.addEventListener("resize", handleViewportChange);
    viewport.addEventListener("scroll", handleViewportChange);
    return () => {
      viewport.removeEventListener("resize", handleViewportChange);
      viewport.removeEventListener("scroll", handleViewportChange);
    };
  }, [open]);
  return (
    <>
      {" "}
      <Search
        onClick={() => {
          setLoading(products.length === 0);
          setOpen(true);
        }}
        className="w-5 h-5 hover:text-shop-light-green hoverEffect cursor-pointer"
      />{" "}
      <CommandDialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) {
            setLoading(products.length === 0);
          }
          setOpen(nextOpen);
          if (!nextOpen) {
            setKeyboardOpen(false);
          }
        }}
        className={keyboardOpen ? "top-[8%]" : undefined}
      >
        {" "}
        <CommandInput placeholder="Search products..." />{" "}
        <CommandList>
          {" "}
          {loading && (
            <div className="p-4 flex items-center justify-center">
              {" "}
              <Loader2 className="animate-spin w-5 h-5 text-shop-light-green" />{" "}
            </div>
          )}{" "}
          {!loading && <CommandEmpty>No products found.</CommandEmpty>}{" "}
          {!loading && products.length > 0 && (
            <CommandGroup heading="Products">
              {" "}
              {products.map((product) => (
                <CommandItem
                  key={product._id}
                  value={`${product.title} ${product.category?.join(" ") || ""}`}
                  onSelect={() => {
                    setOpen(false);
                    router.push(`/product/${product?.slug?.current}`);
                  }}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  {" "}
                  {product.image && (
                    <Image
                      src={urlFor(product.image).url()}
                      alt={product.title}
                      width={40}
                      height={40}
                      className="rounded-md w-10 h-10 object-cover border"
                    />
                  )}{" "}
                  <div className="flex flex-col">
                    {" "}
                    <span className="font-semibold text-sm">
                      {" "}
                      {product.title}{" "}
                    </span>{" "}
                    <span className="text-xs text-shop-light-text">
                      {" "}
                      {product.category?.[0] || "General"}{" "}
                    </span>{" "}
                  </div>{" "}
                </CommandItem>
              ))}{" "}
            </CommandGroup>
          )}{" "}
        </CommandList>{" "}
      </CommandDialog>{" "}
    </>
  );
};
export default SearchBar;
