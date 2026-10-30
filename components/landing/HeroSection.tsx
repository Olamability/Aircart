import HeroAppPrevieww from "@/components/landing/HeroAppPrevieww";
import Container from "@/components/Container";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-shop-light-bg">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -left-32 top-8 size-72 rounded-full bg-shop-lighter-green/20 blur-3xl" />

      <div className="pointer-events-none absolute -right-32 bottom-0 size-80 rounded-full bg-shop-light-pink/40 blur-3xl" />

      <Container className="px-6 sm:px-10 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 items-center gap-8 py-8 sm:gap-10 sm:py-10 md:grid-cols-[0.95fr_1.05fr] md:gap-8 md:py-12 lg:gap-10 lg:py-10">
          {/* Content */}
          <div className="relative z-10 min-w-0 max-w-lg">
            {/* Quality label */}
            <div className="mb-7 flex w-fit items-center justify-center gap-2 rounded-full border border-shop-dark-green/10 bg-shop-dark-green/10 px-4 py-2 shadow-sm sm:mb-8">
              <span className="size-2 shrink-0 rounded-full bg-shop-light-green" />

              <span className="whitespace-nowrap text-[11px] font-medium tracking-wider text-shop-dark-green sm:text-xs">
                QUALITY | VALUE | CONVENIENCE
              </span>
            </div>

            {/* Main headline */}
            <h1 className="font-heading text-3xl font-bold leading-[1.08] tracking-tight text-darkColor sm:text-4xl md:text-5xl lg:text-[3.5rem]">
              Everything You Need
              <span className="block text-shop-darkOrange">
                Delivered to Your Doorstep.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-5 max-w-xl text-base leading-relaxed text-shop-light-color/70 sm:text-lg">
              Shop what you need, pay your bills, discover useful services and
              move things with ease—all through Spaazr.
            </p>

            {/* Call-to-action buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/download"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-shop-btn-dark-green px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-shop-dark-green/15 transition-colors hover:bg-shop-dark-green"
              >
                Get the Spaazr App
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>

              <Link
                href="/services"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-shop-dark-green/15 bg-shop-darkOrange px-6 py-3.5 text-sm font-semibold text-shop-dark-green transition-colors hover:border-shop-dark-green/30"
              >
                Explore Services
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>

            {/* Service benefits */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-shop-light-color sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2
                  size={15}
                  className="shrink-0 text-shop-light-green"
                />
                One platform
              </span>

              <span className="inline-flex items-center gap-2">
                <CheckCircle2
                  size={15}
                  className="shrink-0 text-shop-light-green"
                />
                Multiple services
              </span>

              <span className="inline-flex items-center gap-2">
                <CheckCircle2
                  size={15}
                  className="shrink-0 text-shop-light-green"
                />
                Built for everyday life
              </span>
            </div>
          </div>

          {/* App mockup */}
          <div className="relative mx-auto w-full min-w-0 max-w-[380px] md:ml-auto md:mr-0">
            <HeroAppPrevieww className="w-full" />
          </div>
        </div>
      </Container>
    </section>

  );
}