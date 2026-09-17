import { Title, SubText } from "@/components/text";
import Link from "next/link";
import Image from "next/image";
import Ryan from "../Images/Ryan.jpeg";
import React from "react";

const HomeBanner = () => {
  return (
    <div className="py-16 md:py-0 bg-shop-light-pink rounded-lg px-10 lg:px-24 flex items-center justify-between">
      <div className="space-y-5">
        <Title className="text-xl md:text-2xl font-bold">
          Grab upto 50%  <br /> off on
          selected Headphones
        </Title>
        <Link
          href={"/shop"}
          className="bg-shop-dark-green/90 text-white px-5 py-2
        rounded-md text-sm font-semibold hover:text-white
        hover:bg-shop-dark-green hoverEffect"
        >
          Buy Now
        </Link>
      </div>
      <div className="py-4 md:pt-6 md:-mr-12 lg:-mr-16 relative">
        <Image
          className=" md:inline-flex rounded-lg object-cover scale-110 -translate-y-2"
          src={Ryan}
          alt="Headphones"
          width={200}
          height={300}
        />
      </div>
    </div>
  );
};

export default HomeBanner;
