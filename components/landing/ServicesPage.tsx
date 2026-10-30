import FAQSection from "@/components/landing/FAQSection";
import { serviceFaqs } from "@/constants/faqs";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    CheckCircle2,
    CreditCard,
    Laptop,
    Package,
    ShoppingBasket,
    ShoppingBag,
    Smartphone,
    Store,
    Truck,
    Wallet,
} from "lucide-react";

const serviceSections = [
    {
        number: "01",
        eyebrow: "FOOD & EVERYDAY ESSENTIALS",
        title: "Everyday essentials, made easier to discover.",
        description:
            "From groceries and food items to household essentials, Spaazr is designed to help you explore products for everyday living in one convenient digital experience.",
        image: "/images/airmart/services-groceries.jpg",
        alt: "Fresh groceries and everyday food essentials",
        features: [
            {
                icon: ShoppingBasket,
                title: "Groceries & Food Items",
                description:
                    "Explore food products and everyday essentials available through participating sellers.",
            },
            {
                icon: ShoppingBag,
                title: "Household Essentials",
                description:
                    "Discover useful products for your home and daily routine.",
            },
            {
                icon: Store,
                title: "Participating Sellers",
                description:
                    "Find products offered by businesses participating in the Spaazr marketplace.",
            },
        ],
        cta: "Explore Products",
        href: "/shop",
        reverse: false,
    },
    {
        number: "02",
        eyebrow: "BILLS & DIGITAL PAYMENTS",
        title: "Make everyday digital tasks simpler.",
        description:
            "Spaazr aims to bring shopping and useful digital services closer together. Where bill-payment and top-up services are available, customers can explore supported options through the platform.",
        image: "/images/airmart/services-bills.jpg",
        alt: "Person using a smartphone for a digital payment",
        features: [
            {
                icon: Smartphone,
                title: "Airtime & Data",
                description:
                    "Access supported mobile top-up options where available.",
            },
            {
                icon: CreditCard,
                title: "Bill Payments",
                description:
                    "Explore supported bill-payment services as they become available on the platform.",
            },
            {
                icon: Wallet,
                title: "Convenient Transactions",
                description:
                    "A simpler digital experience for supported everyday payment needs.",
            },
        ],
        cta: "Contact Our Team",
        href: "/contact",
        reverse: true,
    },
    {
        number: "03",
        eyebrow: "GADGETS & TECHNOLOGY",
        title: "Find technology that fits your everyday life.",
        description:
            "Discover gadgets, electronics, and accessories for work, study, communication, and entertainment. Spaazr brings product discovery into a convenient online shopping experience.",
        image: "/images/airmart/services-gadgets.jpg",
        alt: "Smartphones, laptops, and electronic accessories",
        features: [
            {
                icon: Smartphone,
                title: "Phones & Accessories",
                description:
                    "Explore available smartphones, chargers, cases, and other accessories.",
            },
            {
                icon: Laptop,
                title: "Computers & Electronics",
                description:
                    "Discover technology products for work, education, and home use.",
            },
            {
                icon: CheckCircle2,
                title: "Product Information",
                description:
                    "Review available product details before deciding what to buy.",
            },
        ],
        cta: "Shop Gadgets",
        href: "/shop",
        reverse: false,
    },
    {
        number: "04",
        eyebrow: "DELIVERY & LOGISTICS",
        title: "Helping products get where they need to go.",
        description:
            "Delivery is an important part of a connected commerce experience. Spaazr's logistics offering is intended to support convenient movement of goods, subject to available services and delivery coverage.",
        image: "/images/airmart/services-logistics.jpg",
        alt: "Delivery rider carrying a parcel",
        features: [
            {
                icon: Package,
                title: "Parcel Delivery",
                description:
                    "Explore delivery options where parcel services are available.",
            },
            {
                icon: Truck,
                title: "Delivery Partnerships",
                description:
                    "Learn about opportunities to participate in the Spaazr delivery network.",
            },
            {
                icon: Store,
                title: "Support for Businesses",
                description:
                    "Explore how delivery services may support participating businesses and their customers.",
            },
        ],
        cta: "Become a Rider",
        href: "/become-a-partner/rider",
        reverse: true,
    },
    {
        number: "05",
        eyebrow: "MARKETPLACE & BUSINESS OPPORTUNITIES",
        title: "A place for customers and businesses to connect.",
        description:
            "Spaazr brings product discovery and online shopping together while creating opportunities for businesses to reach customers. Whether you want to shop or explore selling, the marketplace is a place to start.",
        image: "/images/airmart/services-marketplace.jpg",
        alt: "Small business owner preparing products for online customers",
        features: [
            {
                icon: ShoppingBag,
                title: "Discover Products",
                description:
                    "Browse available products across supported marketplace categories.",
            },
            {
                icon: Store,
                title: "Sell Through Spaazr",
                description:
                    "Explore vendor registration and the requirements for participating in the marketplace.",
            },
            {
                icon: UsersIcon,
                title: "Grow Your Reach",
                description:
                    "Explore opportunities to connect your business with more potential customers.",
            },
        ],
        cta: "Become a Vendor",
        href: "/become-a-partner/vendor",
        reverse: false,
    },
];

function UsersIcon({ size = 24 }: { size?: number }) {
    return <Store size={size} />;
}

const serviceHighlights = [
    {
        title: "One connected experience",
        description:
            "Discover products and explore supported services through the Spaazr platform.",
        icon: Smartphone,
    },
    {
        title: "Convenience for everyday life",
        description:
            "Find products and useful options for your everyday needs in one place.",
        icon: ShoppingBag,
    },
    {
        title: "Opportunities for businesses",
        description:
            "Give your business an opportunity to participate in digital commerce.",
        icon: Store,
    },
];

export default function ServicesPage() {
    return (
        <div className="overflow-hidden bg-white text-slate-800">
            {/* Hero */}
            <section className="overflow-hidden bg-shop-light-green/10">
                <div className="mx-auto grid min-h-[440px] max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:px-10 lg:py-20">
                    <div>
                        <span className="inline-flex rounded-full border border-shop-dark-green/15 bg-white px-4 py-2 text-sm font-semibold text-shop-dark-green shadow-sm">
                            Discover Spaazr Services
                        </span>

                        <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-shop-dark-green sm:text-4xl lg:text-5xl">
                            More for everyday life.
                            <span className="mt-2 block text-shop-darkOrange">
                                All in one connected experience.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                            Explore everyday essentials, gadgets, digital services,
                            and marketplace opportunities through Spaazr. We are
                            building a more convenient way for customers and
                            businesses to connect.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/shop"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-shop-dark-green px-7 py-3 font-semibold text-white transition hover:bg-shop-darkOrange"
                            >
                                Explore Marketplace
                                <ArrowRight size={18} />
                            </Link>

                            <Link
                                href="/become-a-partner/vendor"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-shop-dark-green/25 bg-white px-7 py-3 font-semibold text-shop-dark-green transition hover:bg-shop-dark-green hover:text-white"
                            >
                                Become a Partner
                            </Link>
                        </div>
                    </div>

                    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-shop-dark-green/10 bg-white shadow-xl">
                            <Image
                                src="/images/airmart/services-hero.jpg"
                                alt="Products and everyday essentials available to explore through Spaazr"
                                fill
                                priority
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover"
                            />
                        </div>

                        <div className="pointer-events-none absolute -bottom-4 -right-3 h-24 w-24 rounded-full border-[12px] border-shop-darkOrange/30 sm:-right-5" />
                    </div>
                </div>
            </section>

            {/* Service overview */}
            <section className="py-16 sm:py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-shop-darkOrange">
                            What We Offer
                        </p>

                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-shop-dark-green sm:text-4xl">
                            Explore the services built around your needs.
                        </h2>

                        <p className="mt-5 leading-8 text-slate-600">
                            From discovering everyday products to exploring
                            digital services and business opportunities, see
                            how Spaazr is bringing different needs together.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-5 md:grid-cols-3">
                        {serviceHighlights.map((item) => {
                            const Icon = item.icon;

                            return (
                                <article
                                    key={item.title}
                                    className="rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-7"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-shop-light-green/20 text-shop-dark-green">
                                        <Icon size={24} />
                                    </div>

                                    <h3 className="mt-5 text-lg font-bold text-shop-dark-green">
                                        {item.title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-7 text-slate-600">
                                        {item.description}
                                    </p>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Detailed service sections */}
            {serviceSections.map((service) => (
                <section
                    key={service.number}
                    className={
                        service.number === "02" || service.number === "04"
                            ? "bg-shop-light-green/10 py-16 sm:py-20 lg:py-24"
                            : "py-16 sm:py-20 lg:py-24"
                    }
                >
                    <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                        <div
                            className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${service.reverse ? "lg:[&>div:first-child]:order-2" : ""
                                }`}
                        >
                            {/* Image */}
                            <div className="relative">
                                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-shop-dark-green/10 bg-shop-light-green/15 shadow-sm">
                                    <Image
                                        src={service.image}
                                        alt={service.alt}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        className="object-cover transition duration-500 hover:scale-[1.03]"
                                    />
                                </div>

                                <div className="absolute -bottom-4 left-5 rounded-xl border border-slate-100 bg-white px-5 py-3 shadow-lg sm:left-8">
                                    <span className="text-sm font-bold text-shop-dark-green">
                                        Spaazr Services
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="pt-3 lg:pt-0">
                                <span className="text-sm font-bold uppercase tracking-[0.16em] text-shop-darkOrange">
                                    {service.eyebrow}
                                </span>

                                <div className="mt-3 flex items-start gap-3">
                                    <span className="hidden pt-1 text-sm font-bold text-shop-dark-green/40 sm:block">
                                        {service.number}
                                    </span>

                                    <h2 className="text-3xl font-bold leading-tight tracking-tight text-shop-dark-green sm:text-4xl">
                                        {service.title}
                                    </h2>
                                </div>

                                <p className="mt-5 text-base leading-8 text-slate-600">
                                    {service.description}
                                </p>

                                <div className="mt-7 space-y-5">
                                    {service.features.map((feature) => {
                                        const Icon = feature.icon;

                                        return (
                                            <div
                                                key={feature.title}
                                                className="flex items-start gap-4"
                                            >
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-shop-light-green/25 text-shop-dark-green">
                                                    <Icon size={22} />
                                                </div>

                                                <div>
                                                    <h3 className="font-bold text-slate-900">
                                                        {feature.title}
                                                    </h3>

                                                    <p className="mt-1 text-sm leading-7 text-slate-600">
                                                        {feature.description}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <Link
                                    href={service.href}
                                    className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-shop-dark-green px-6 py-3 font-semibold text-white transition hover:bg-shop-darkOrange"
                                >
                                    {service.cta}
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            ))}

            {/* Final CTA */}
            <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
                <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-shop-dark-green px-6 py-12 text-center sm:px-12 sm:py-16">
                    <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[40px] border-white/5" />
                    <div className="pointer-events-none absolute -bottom-24 -left-12 h-64 w-64 rounded-full border-[40px] border-shop-darkOrange/20" />

                    <div className="relative mx-auto max-w-3xl">
                        <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                            Your Spaazr Journey Starts Here
                        </span>

                        <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Let's make everyday living simpler.
                        </h2>

                        <p className="mt-5 leading-8 text-white/80">
                            Explore the marketplace, discover available products,
                            or learn how your business can become part of Spaazr.
                        </p>

                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <Link
                                href="/shop"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-shop-darkOrange px-7 py-3 font-semibold text-white transition hover:bg-orange-600"
                            >
                                Explore Marketplace
                                <ArrowRight size={18} />
                            </Link>

                            <Link
                                href="/contact"
                                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/40 px-7 py-3 font-semibold text-white transition hover:bg-white hover:text-shop-dark-green"
                            >
                                Contact Us
                            </Link>
                        </div>

                    </div>

                </div>
                <FAQSection
                    eyebrow="NEED TO KNOW"
                    title="Questions About Our Services"
                    description="Learn how Spaazr brings shopping, deliveries, payments, and everyday services together."
                    faqs={serviceFaqs}
                />
            </section>
        </div>
    );
}
