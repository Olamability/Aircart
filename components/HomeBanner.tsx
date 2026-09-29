import { Title } from "@/components/text";
import Link from "next/link";
import Image from "next/image";
import Hero from "../Images/Hero.jpeg";
import React from "react";

const HomeBanner = () => {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl bg-shop-light-green/5">
      {/* Decorative background elements */}
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/40 blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-shop-light-green/20 blur-3xl" />

      <div className="relative flex min-h-64 items-center justify-between px-6 py-8 sm:px-10 sm:py-10 md:min-h-72 md:px-14 lg:px-20">
        {/* Content */}
        <div className="relative z-10 max-w-md space-y-5 sm:space-y-6">
          <span className="inline-flex w-fit items-center rounded-full bg-shop-dark-green/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-shop-dark-green">
            QUALITY | VALUE | CONVENIENCE
          </span>

          <div className="space-y-2">
            <Title className="text-2xl font-bold leading-[1.05] tracking-wider text-shop-dark-green sm:text-3xl md:text-4xl">
              Everything You Need <br />
              Delivered to <br />
              <span className="text-orange-400">Your Doorstep</span>
            </Title>

            <p className="max-w-sm text-xs text-slate-600 sm:text-base">
              Shop everyday essentials, groceries, food, products and more all
              in one convenient place..
              <br className="font-semibold" />
              Quality your can trust, convinience you&apos;ll love
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-md bg-shop-dark-green px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-shop-dark-green/90 hover:shadow-md"
          >
            Shop Now
          </Link>
        </div>

        {/* Product image */}
        <div className="absolute bottom-0 right-0 hidden h-full w-[55%] items-end justify-end sm:right-2 sm:flex sm:w-[52%] md:right-4 md:w-[50%] lg:right-8 lg:w-[48%]">
          <div className="relative flex h-[105%] w-full items-end justify-center">
            <div className="absolute bottom-4 h-32 w-56 rounded-full bg-white/50 blur-2xl sm:h-40 sm:w-64" />

            <Image
              src={Hero}
              alt="Featured product"
              width={800}
              height={800}
              priority
              className="relative z-10 h-full w-auto max-w-none object-contain drop-shadow-[0_18px_24px_rgba(6,60,40,0.16)] transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeBanner;
