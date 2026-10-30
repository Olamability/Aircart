import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bike,
  CreditCard,
  ShoppingBag,
  Sparkles,
  Store,
  Utensils,
} from "lucide-react";
import Container from "@/components/Container";

const services = [
  {
    title: "Marketplace",
    description:
      "Discover products and everyday essentials from businesses across the Spaazr ecosystem.",
    action: "Explore marketplace",
    href: "/shop",
    icon: Store,
    variant: "marketplace",
  },
  {
    title: "Food & Groceries",
    description:
      "Find meals, fresh groceries and daily essentials from businesses on Spaazr.",
    action: "Explore food & groceries",
    href: "/category/food-beverages",
    icon: Utensils,
    variant: "food",
  },
  {
    title: "Bills & Payments",
    description:
      "Manage everyday payments through one convenient experience.",
    action: "Explore bills",
    href: "/services/bills",
    icon: CreditCard,
    variant: "bills",
  },
  {
    title: "Shop Gadgets",
    description:
      "Explore phones, appliances and useful technology.",
    action: "Start shopping",
    href: "/shop",
    icon: ShoppingBag,
    variant: "gadgets",
  },
  {
    title: "Logistics",
    description:
      "Find convenient ways to send packages and arrange deliveries.",
    action: "Explore logistics",
    href: "/services/logistics",
    icon: Bike,
    variant: "logistics",
  },
  {
    title: "Everyday Services",
    description:
      "Discover useful services and businesses for everyday needs.",
    action: "Discover services",
    href: "/services",
    icon: Sparkles,
    variant: "everyday",
  },
];

const cardStyles: Record<
  string,
  {
    card: string;
    icon: string;
    action: string;
    glow: string;
    ring: string;
    dot: string;
  }
> = {
  marketplace: {
    card: "border-shop-dark-green bg-shop-dark-green text-white shadow-lg shadow-shop-dark-green/10 hover:shadow-shop-dark-green/20",
    icon: "bg-white/10 text-shop-darkOrange ring-1 ring-white/15",
    action: "text-shop-darkOrange",
    glow: "bg-shop-light-green/25",
    ring: "border-white/10",
    dot: "bg-shop-darkOrange/70",
  },
  food: {
    card: "border-shop-darkOrange/15 bg-[#FFF8EE] text-shop-dark-green hover:border-shop-darkOrange/30",
    icon: "bg-shop-darkOrange/10 text-shop-darkOrange ring-1 ring-shop-darkOrange/10",
    action: "text-shop-dark-green",
    glow: "bg-shop-darkOrange/15",
    ring: "border-shop-darkOrange/15",
    dot: "bg-shop-darkOrange/70",
  },
  bills: {
    card: "border-shop-darkOrange/20 bg-[#FFF8EE] text-shop-dark-green hover:border-shop-darkOrange/40",
    icon: "bg-shop-darkOrange/12 text-shop-darkOrange",
    action: "text-shop-dark-green",
    glow: "bg-shop-darkOrange/20",
    ring: "border-shop-darkOrange/20",
    dot: "bg-shop-darkOrange/80",
  },
  gadgets: {
    card: "border-[#E26D5C]/20 bg-[#FFF5F2] text-shop-dark-green hover:border-[#E26D5C]/40",
    icon: "bg-[#E26D5C]/10 text-[#D85F4E]",
    action: "text-shop-dark-green",
    glow: "bg-[#E26D5C]/15",
    ring: "border-[#E26D5C]/15",
    dot: "bg-[#E26D5C]/70",
  },
  logistics: {
    card: "border-[#3B9C3C]/20 bg-[#F2FAF1] text-shop-dark-green hover:border-[#3B9C3C]/40",
    icon: "bg-[#3B9C3C]/10 text-[#287D2C]",
    action: "text-shop-dark-green",
    glow: "bg-[#3B9C3C]/15",
    ring: "border-[#3B9C3C]/15",
    dot: "bg-[#3B9C3C]/70",
  },
  everyday: {
    card: "border-shop-dark-green/15 bg-[#F3F7F3] text-shop-dark-green hover:border-shop-dark-green/30",
    icon: "bg-shop-dark-green/10 text-shop-dark-green",
    action: "text-shop-dark-green",
    glow: "bg-shop-light-green/20",
    ring: "border-shop-dark-green/10",
    dot: "bg-shop-light-green",
  },
};

export default function ServiceShowcase() {
  return (
    <section className="relative overflow-hidden bg-white py-14 sm:py-20 lg:py-24">
      {/* Soft ambient brand colours */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-40 size-80 rounded-full bg-shop-light-green/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-10 size-96 rounded-full bg-shop-darkOrange/[0.06] blur-3xl"
      />

      <Container className="relative px-5 sm:px-8 lg:px-12">
        {/* Centred section introduction */}
        <div className="mx-auto mb-9 max-w-3xl text-center sm:mb-12 lg:mb-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-shop-dark-green/10 bg-shop-dark-green/[0.04] px-3.5 py-1.5">
            <span className="size-1.5 rounded-full bg-shop-darkOrange" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-shop-dark-green sm:text-xs">
              THE SPAAZR EXPERIENCE
            </span>
          </div>

          <h2 className="font-heading text-2xl font-bold leading-[1.12] tracking-tight text-shop-dark-green sm:text-4xl lg:text-3xl">
            More of everyday life,
            <span className="mt-1 block text-shop-darkOrange">
              all in one place.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-5 sm:text-base sm:leading-7">
            From shopping and food to payments and useful services,
            discover more ways to make everyday life convenient with Spaazr.
          </p>

          <Link
            href="/services"
            className="group mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-shop-dark-green transition-colors duration-200 hover:text-shop-darkOrange"
          >
            Explore our services
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Responsive service bento grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;
            const style = cardStyles[service.variant];
            const isFeature =
              service.variant === "marketplace" ||
              service.variant === "food";
            const isDark = service.variant === "marketplace";

            return (
              <Link
                key={service.title}
                href={service.href}
                className={`hoverEffect group relative isolate flex min-h-[218px] flex-col overflow-hidden rounded-3xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6 ${isFeature
                  ? "sm:min-h-[250px] xl:col-span-2 xl:min-h-[270px] xl:p-8"
                  : "sm:min-h-[225px]"
                  } ${style.card}`}
              >
                {/* Large soft colour glow */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute -right-12 -top-14 -z-10 size-44 rounded-full blur-3xl transition-transform duration-500 group-hover:scale-125 sm:size-52 ${style.glow}`}
                />

                {/* Fine circular pattern */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute -right-12 -top-12 -z-10 size-44 rounded-full border sm:size-52 ${style.ring}`}
                />
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute -right-5 -top-5 -z-10 size-28 rounded-full border sm:size-32 ${style.ring}`}
                />
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute right-8 top-8 -z-10 size-2 rounded-full ${style.dot}`}
                />
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute right-14 top-14 -z-10 size-1.5 rounded-full ${style.dot}`}
                />

                {/* Subtle lower corner detail on the two feature cards */}
                {isFeature && (
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute -bottom-16 -left-12 -z-10 size-44 rounded-full border ${isDark
                      ? "border-white/[0.07]"
                      : "border-shop-darkOrange/10"
                      }`}
                  >
                    <div
                      className={`absolute inset-5 rounded-full border ${isDark
                        ? "border-white/[0.07]"
                        : "border-shop-darkOrange/10"
                        }`}
                    />
                  </div>
                )}

                {/* Card header */}
                <div className="relative z-10 flex items-start justify-between">
                  <div
                    className={`flex size-12 items-center justify-center rounded-2xl ring-1 ring-inset transition-transform duration-300 group-hover:scale-105 sm:size-14 ${style.icon}`}
                  >
                    <Icon size={23} strokeWidth={1.7} />
                  </div>

                  <span
                    className={`flex size-10 items-center justify-center rounded-full transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${isDark
                      ? "bg-white/10 text-white ring-1 ring-white/10 group-hover:bg-shop-darkOrange group-hover:text-shop-dark-green"
                      : "bg-white/80 text-shop-dark-green ring-1 ring-black/[0.04] group-hover:bg-shop-dark-green group-hover:text-white"
                      }`}
                  >
                    <ArrowUpRight size={18} />
                  </span>
                </div>

                {/* Card copy */}
                <div className="relative z-10 mt-auto pt-7">
                  {isFeature && (
                    <span
                      className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] ${isDark
                        ? "text-shop-darkOrange"
                        : "text-shop-dark-green/60"
                        }`}
                    >
                      {isDark ? "Discover more" : "Everyday essentials"}
                    </span>
                  )}

                  <h3
                    className={`font-heading font-bold tracking-tight ${isFeature
                      ? "text-xl sm:text-2xl lg:text-3xl"
                      : "text-lg sm:text-xl"
                      } ${isDark ? "text-white" : "text-shop-dark-green"}`}
                  >
                    {service.title}
                  </h3>

                  <p
                    className={`mt-2 max-w-md text-sm leading-6 ${isDark ? "text-white/75" : "text-slate-600"
                      }`}
                  >
                    {service.description}
                  </p>

                  <span
                    className={`mt-4 inline-flex items-center gap-2 text-xs font-bold sm:text-sm ${style.action}`}
                  >
                    {service.action}
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quiet closing brand statement */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-200/80 pt-6 text-center sm:mt-10 sm:flex-row sm:gap-4 sm:pt-7 sm:text-left">
          <p className="text-xs leading-5 text-slate-500 sm:text-sm">
            One ecosystem. More ways to meet your everyday needs.
          </p>

          <span className="text-xs font-semibold text-shop-dark-green sm:text-sm">
            Value you can trust. Convenience you&apos;ll love.
          </span>
        </div>
      </Container>
    </section>
  );
}
