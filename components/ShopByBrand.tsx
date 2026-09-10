import React from "react";
import Link from "next/link";
import { Title } from "./text";
import { getBrands } from "@/sanity/queries";
import Image from "next/image";
import { GitCompareArrows, Headset, Truck } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";

const serviceData = [
  {
    title: "Free Delivery",
    description: "Free delivery over N50,000",
    icon: <Truck size={40} strokeWidth={1.5} />,
  },

  {
    title: "Free Return",
    description: "Free return over N50,000",
    icon: <GitCompareArrows size={40} strokeWidth={1.5} />,
  },

  {
    title: "Instant Customer Support",
    description: "Free return over N50,000",
    icon: <Headset size={40} strokeWidth={1.5} />,
  },
];

const ShopByBrand = async () => {
  const brands = await getBrands();
  return (
    <div className="mb-10 lg:pb-10 bg-shop-light-bg p-5 lg:p-7 rounded-md ">
      <div className=" flex items-center gap-5 justify-between mb-10">
        <Title>Shop by Brands</Title>
        <Link
          href={"/shop"}
          className="text-sm font-semibold tracking-wide 
      hover:text-shop-btn-dark-green hoverEffect"
        >
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {brands?.map((brand) => (
          <Link
            key={brand?._id}
            href={{ pathname: "/shop", query: { brand: brand?.slug?.current } }}
            className="bg-white w-34 h-24 flex items-center 
        justify-center rounded-md overflow-hidden hover:shadow-lg 
        shadow-shop-dark-green/20 hoverEffect"
          >
            {brand?.logo && (
              <Image
                src={urlFor(brand?.logo).url()}
                alt={brand?.title || "Brand logo"}
                width={250}
                height={250}
                className="w-32 h-32 object-contain"
              />
            )}
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-16 border-2 border-shop-light-green/30 bg-shop-light-green/20 p-2 shadow-sm inner hover:shadow-shop-light-green/50 py-5">
        {serviceData?.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 group text-lightColor"
          >
            <span className="inline-flex scale-100 group-hover:scale-90 hover:text-shop-light-green hoverEffect">
              {item?.icon}
            </span>
            <div className="text-sm">
              <p className="text-darkColor/80 font-bold capitalize">
                {item?.title}
              </p>
              <p className="text-lightColor">{item?.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopByBrand;
