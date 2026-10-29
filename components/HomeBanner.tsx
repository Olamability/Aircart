import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Title } from "@/components/text";
import Link from "next/link";
import HeroAppPrevieww from "./landing/HeroAppPrevieww";

const HomeBanner = () => {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl bg-shop-light-green/5">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-shop-light-green/20 blur-3xl" />

      <div className="relative mx-auto grid grid-cols-1 items-center gap-6 px-4 py-6 sm:px-6 sm:py-7 md:grid-cols-[1.1fr_0.9fr] md:gap-6 md:px-8 md:py-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:px-10 lg:py-8 xl:px-12">
        {/* Hero text */}
        <div className="relative z-10 min-w-0 space-y-4 sm:space-y-5">
          <span className="inline-flex w-fit items-center rounded-full bg-shop-darkOrange/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-shop-dark-green sm:text-[11px]">
            QUALITY | VALUE | CONVENIENCE
          </span>

          <div className="space-y-2.5">
            <Title className="text-[1.85rem] font-bold leading-[1.08] tracking-tight text-shop-dark-green sm:text-4xl md:text-[2.5rem] lg:text-[3rem] xl:text-[3.25rem]">
              Everything You Need
              <br />
              Delivered <span className="normal-case">to</span>
              <br />
              <span className="text-shop-darkOrange">Your Doorstep</span>
            </Title>

            <p className="max-w-lg text-xs leading-relaxed text-slate-600 sm:text-sm lg:text-[13px]">
              Shop groceries, food and everyday essentials, pay bills, and
              discover useful services—all with the convenience of Airmart.
            </p>

            <p className="text-xs font-semibold text-red-600 sm:text-sm">
              Value you can trust, convenience you&apos;ll love.
            </p>
          </div>

          {/* Primary hero CTAs */}
          <div className="flex flex-col gap-2.5 pt-1 min-[420px]:flex-row min-[420px]:flex-wrap">
            <Link
              href="/download"
              className="hoverEffect inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-shop-btn-dark-green px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-shop-dark-green/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-shop-dark-green/90 hover:shadow-md"
            >
              Get the Airmart App
              <ArrowUpRight size={16} className="shrink-0" />
            </Link>

            <Link
              href="/become-a-partner"
              className="hoverEffect inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-shop-dark-green/20 bg-white px-5 py-3 text-sm font-semibold text-shop-dark-green transition-all duration-200 hover:-translate-y-0.5 hover:border-shop-dark-green/40 hover:bg-shop-dark-green/5 hover:shadow-md"
            >
              Become a Partner
              <ArrowRight size={16} className="shrink-0" />
            </Link>
          </div>

          {/* Secondary action */}
          <div className="pt-0.5">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-shop-dark-green underline-offset-4 transition-colors hover:text-shop-darkOrange hover:underline"
            >
              Shop Now
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* App preview */}
        <div className="relative mx-auto w-full min-w-0 max-w-[320px] sm:max-w-[350px] md:ml-auto md:mr-0 md:max-w-[300px] lg:max-w-[350px] xl:max-w-[380px]">
          <HeroAppPrevieww className="w-full" />
        </div>
      </div>
    </section>
  );
};

export default HomeBanner;