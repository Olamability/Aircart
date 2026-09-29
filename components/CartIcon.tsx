"use client";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import React from "react";
import useStore from "@/store";

const CartIcon = () => {
  const { items } = useStore();
  return (
    <Link href={"/cart"} className="group relative">
      <ShoppingBag className="w-5 h-5 hover:text-shop-light-green hoverEffect" />
      <span className="absolute -top-1.5 -right-2 bg-red-600 text-white min-w-4 h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center leading-none">
        {items?.length ? items?.length : 0}
      </span>
    </Link>
  );
};

export default CartIcon;
