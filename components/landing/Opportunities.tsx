
"use client";
import FAQSection from "@/components/landing/FAQSection";
import { riderFaqs } from "@/constants/faqs";
import Link from "next/link";
import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Clock3,
    MapPin,
    TrendingUp,
    Wallet,
} from "lucide-react";

const benefits = [
    {
        icon: Wallet,
        title: "Competitive Pay, Real Opportunity",
        description:
            "Earn based on your delivery activity, with opportunities to grow your income as you take on more deliveries.",
        color: "bg-shop-darkOrange/10 text-shop-darkOrange",
    },
    {
        icon: Clock3,
        title: "Flexible Hours, Your Way",
        description:
            "Enjoy the flexibility to fit delivery work around your schedule, goals, and lifestyle.",
        color: "bg-shop-light-green/10 text-shop-light-green",
    },
    {
        icon: TrendingUp,
        title: "Grow and Earn with Us",
        description:
            "Build valuable experience and grow alongside a platform designed to make everyday services more accessible.",
        color: "bg-shop-dark-green/10 text-shop-dark-green",
    },
];

const riderImages = [
    {
        src: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=85",
        alt: "Motorcycle ready for the road",
        label: "Your journey",
        position: "center",
    },
    {
        src: "https://images.unsplash.com/photo-1543465077-db45d34b88a5?auto=format&fit=crop&w=900&q=85",
        alt: "Delivery rider on the move",
        label: "Your flexibility",
        position: "center",
    },
    {
        src: "https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=900&q=85",
        alt: "Delivery bag prepared for an order",
        label: "Every delivery",
        position: "center",
    },
    {
        src: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=900&q=85",
        alt: "Transport and delivery on the road",
        label: "Your next step",
        position: "center",
    },
];

export default function RiderOpportunities() {
    return (
        <section
            id="rider-opportunities"
            className="relative isolate overflow-hidden border-t border-slate-200/80 bg-white pt-6 pb-14 sm:pt-10 sm:pb-16 lg:pt-12 lg:pb-20"
        >
            {/* Soft background accents */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-32 top-20 -z-10 h-72 w-72 rounded-full bg-shop-light-green/10 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-80 w-80 rounded-full bg-shop-darkOrange/10 blur-3xl"
            />

            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Centered section label across every screen */}
                <div className="mb-7 flex justify-center sm:mb-9 lg:mb-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-shop-light-green/20 bg-shop-light-green/10 px-3.5 py-2">
                        <span className="h-2 w-2 rounded-full bg-shop-light-green" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.19em] text-shop-dark-green sm:text-xs">
                            Opportunities
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 items-center gap-10 md:gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
                    {/* LEFT: Opportunity details */}
                    <div className="mx-auto w-full max-w-2xl text-center lg:mx-0 lg:text-left">
                        <h2 className="mx-auto max-w-xl text-3xl font-extrabold leading-[1.12] tracking-tight text-shop-dark-green sm:text-4xl md:text-5xl lg:mx-0 lg:text-[3.4rem]">
                            Turn your time into{" "}
                            <span className="text-shop-darkOrange">opportunity.</span>
                        </h2>

                        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:mt-5 sm:text-base sm:leading-8 lg:mx-0">
                            Become a Spaazr rider and enjoy flexibility, independence, and
                            opportunities to earn. Whether you are looking for regular work
                            or a side hustle, take the next step with a platform built around
                            everyday convenience.
                        </p>

                        {/* Benefits */}
                        <div className="mt-7 space-y-6 sm:mt-8 lg:mt-9">
                            {benefits.map((benefit) => {
                                const Icon = benefit.icon;

                                return (
                                    <div
                                        key={benefit.title}
                                        className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left"
                                    >
                                        <div
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl sm:h-12 sm:w-12 ${benefit.color}`}
                                        >
                                            <Icon size={21} strokeWidth={1.8} />
                                        </div>

                                        <div className="min-w-0 sm:pt-0.5">
                                            <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                                                {benefit.title}
                                            </h3>
                                            <p className="mx-auto mt-1.5 max-w-lg text-sm leading-6 text-slate-600 sm:mx-0">
                                                {benefit.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Calls to action */}
                        <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center lg:justify-start">
                            <Link
                                href="/become-a-partner"
                                className="hoverEffect group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-shop-dark-green px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-shop-dark-green/15 transition-all hover:-translate-y-0.5 hover:bg-shop-dark-green/90"
                            >
                                Become a Rider
                                <ArrowRight
                                    size={17}
                                    className="transition-transform group-hover:translate-x-1"
                                />
                            </Link>

                            <Link
                                href="/services/logistics"
                                className="hoverEffect inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-shop-dark-green transition-all hover:-translate-y-0.5 hover:border-shop-dark-green/30 hover:bg-slate-50"
                            >
                                Explore Logistics
                                <ArrowUpRight size={16} />
                            </Link>
                        </div>

                        {/* Supporting note */}
                        <div className="mx-auto mt-5 flex max-w-md items-start justify-center gap-2 text-center text-xs leading-5 text-slate-500 sm:text-sm lg:mx-0 lg:justify-start lg:text-left">
                            <MapPin
                                size={16}
                                className="mt-0.5 shrink-0 text-shop-darkOrange"
                            />
                            <p>
                                Join a growing delivery ecosystem built for everyday needs.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT: Four-image collage */}
                    <div className="relative mx-auto w-full max-w-2xl lg:max-w-none">
                        {/* Decorative rings */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -right-3 -top-4 h-20 w-20 rounded-full border border-shop-darkOrange/25 sm:-right-5 sm:-top-6 sm:h-32 sm:w-32"
                        />
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -bottom-5 -left-3 h-20 w-20 rounded-full border border-shop-light-green/30 sm:-bottom-7 sm:-left-5 sm:h-28 sm:w-28"
                        />

                        <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
                            {riderImages.map((item, index) => (
                                <div
                                    key={item.label}
                                    className={`group relative isolate aspect-square min-h-0 overflow-hidden rounded-2xl bg-slate-100 shadow-sm ring-1 ring-black/5 sm:rounded-3xl ${index === 1
                                        ? "mt-6 sm:mt-10"
                                        : index === 2
                                            ? "-mt-5 sm:-mt-7"
                                            : ""
                                        }`}
                                >
                                    <img
                                        src={item.src}
                                        alt={item.alt}
                                        loading="lazy"
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        style={{ objectPosition: item.position }}
                                    />

                                    {/* Image overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-shop-dark-green/80 via-shop-dark-green/5 to-transparent" />

                                    {/* Corner accent */}
                                    <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md sm:right-4 sm:top-4 sm:h-9 sm:w-9">
                                        {index === 0 ? (
                                            <ArrowUpRight size={16} />
                                        ) : index === 1 ? (
                                            <Clock3 size={16} />
                                        ) : index === 2 ? (
                                            <Wallet size={16} />
                                        ) : (
                                            <TrendingUp size={16} />
                                        )}
                                    </div>

                                    {/* Image caption */}
                                    <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
                                        <p className="text-sm font-bold text-white sm:text-base">
                                            {item.label}
                                        </p>
                                        <div className="mt-2 h-1 w-8 rounded-full bg-shop-darkOrange transition-all duration-300 group-hover:w-14" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Floating brand note */}
                        <div className="absolute -bottom-4 left-1/2 flex w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/70 bg-white/95 p-3.5 shadow-xl shadow-slate-900/10 backdrop-blur-xl sm:-bottom-5 sm:p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-shop-darkOrange/10 text-shop-darkOrange">
                                <ArrowDownRight size={21} />
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm font-bold text-shop-dark-green">
                                    Your next opportunity starts here.
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    Move forward with Spaazr.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <FAQSection
                eyebrow="RIDER SUPPORT"
                title="Questions About Becoming a Rider"
                description="Find answers about joining the Spaazr delivery network and getting started."
                faqs={riderFaqs}
            />
        </section>
    );
}
