
import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    CheckCircle2,
    Eye,
    HeartHandshake,
    ShoppingBag,
    Smartphone,
    Store,
    Target,
    Truck,
    Users,
} from "lucide-react";
import FAQSection from "./FAQSection";

const audiences = [
    {
        title: "Families and Households",
        description:
            "Discover groceries, household essentials, and products that support your everyday needs.",
        image: "/images/family-shopping.png",
        alt: "Family shopping for everyday essentials",
    },
    {
        title: "Students and Professionals",
        description:
            "Explore gadgets, accessories, and useful products for studying, working, and staying connected.",
        image: "/images/gadgets-section.png",
        alt: "Technology products for work and study",
    },
    {
        title: "Everyday Shoppers",
        description:
            "Browse available products across different categories and discover options that suit your needs.",
        image: "/images/shopping-caart.png",
        alt: "Products available through online shopping",
    },
    {
        title: "Vendors and Businesses",
        description:
            "Explore opportunities to showcase your products and connect with potential customers online.",
        image: "/images/vendor.png",
        alt: "Small business owner preparing products",
    },
];

const benefits = [
    {
        icon: ShoppingBag,
        title: "Everyday Convenience",
        description:
            "Explore multiple shopping categories and supported services through one connected platform.",
    },
    {
        icon: Store,
        title: "A Marketplace for Discovery",
        description:
            "Discover products and offerings from participating businesses in one place.",
    },
    {
        icon: HeartHandshake,
        title: "Opportunities for Businesses",
        description:
            "Create opportunities for vendors to establish a digital presence and reach potential buyers.",
    },
    {
        icon: Smartphone,
        title: "Technology with Purpose",
        description:
            "We focus on practical digital experiences designed around real everyday needs.",
    },
];

const faqs = [
    {
        question: "What is Airmart?",
        answer:
            "Airmart is a digital commerce platform being developed to connect customers with products, everyday essentials, and supported services through a convenient digital experience.",
    },
    {
        question: "What can I find on Airmart?",
        answer:
            "Airmart is designed to bring together categories such as groceries, gadgets, marketplace products, and supported bill-payment services. Availability depends on the services currently offered on the platform.",
    },
    {
        question: "Can I sell my products on Airmart?",
        answer:
            "Interested businesses can explore becoming Airmart vendors. Participation is subject to the applicable registration, verification, and approval requirements.",
    },
    {
        question: "How can I become an Airmart rider?",
        answer:
            "Visit our Become a Rider page to learn about the available partnership process and requirements.",
    },
    {
        question: "Where can I access Airmart?",
        answer:
            "You can explore Airmart through our website. Official mobile app download information should be used when the app is available for your device.",
    },
];

export default function AboutUs() {
    return (
        <main className="overflow-hidden bg-white text-slate-800">

            {/* Hero */}
            <section className="overflow-hidden bg-shop-light-green/2">
                <div className="mx-auto grid min-h-[460px] max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:px-10 lg:py-20">

                    {/* Left: Hero text */}
                    <div className="relative z-10">
                        <span className="inline-flex items-center rounded-full border border-shop-dark-green/15 bg-white/80 px-4 py-2 text-sm font-semibold text-shop-dark-green shadow-sm">
                            Get to know Airmart
                        </span>

                        <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-shop-dark-green sm:text-4xl lg:text-5xl">
                            Everyday essentials.
                            <span className="mt-2 block text-shop-darkOrange">
                                A more connected experience.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                            Are you ready?
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/shop"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-shop-dark-green px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-shop-darkOrange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shop-dark-green"
                            >
                                Explore the Marketplace
                                <ArrowRight size={18} />
                            </Link>

                            <Link
                                href="/become-a-partner/vendor"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-shop-dark-green/25 bg-white/70 px-7 py-3 font-semibold text-shop-dark-green transition hover:border-shop-dark-green hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shop-dark-green"
                            >
                                Become a Partner
                            </Link>
                        </div>
                    </div>

                    {/* Right: Hero image */}
                    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-shop-dark-green/10 bg-white shadow-xl">
                            <Image
                                src="/images/about-us.png"
                                alt="Airmart and its vision for convenient everyday commerce"
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


            {/* About Airmart */}
            <section className="py-16 sm:py-20 lg:py-28">
                <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-10">
                    <div className="relative">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-shop-light-green/20">
                            <Image
                                src="/images/marketplace-section.png"
                                alt="Everyday shopping and digital commerce"
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover"
                            />
                        </div>

                        <div className="absolute -bottom-5 right-4 max-w-[260px] rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:right-8 sm:p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-shop-light-green/15 text-shop-dark-green">
                                    <HeartHandshake size={23} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">
                                        Built around everyday needs
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Customers, businesses, and services
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 lg:pt-0">
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-shop-darkOrange">
                            About Us
                        </p>

                        <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-shop-dark-green sm:text-4xl">
                            Making everyday commerce more convenient.
                        </h2>

                        <div className="mt-6 space-y-5 text-base leading-8 text-slate-600">
                            <p>
                                At Airmart, we believe technology should make everyday life
                                more convenient and create meaningful opportunities for people
                                and businesses.
                            </p>

                            <p>
                                Finding groceries, choosing the right gadgets, shopping for
                                household essentials, and accessing useful services can mean
                                navigating several platforms. We see an opportunity to bring
                                these experiences closer together.
                            </p>

                            <p>
                                That is the idea behind Airmart: a connected digital commerce
                                platform designed to help customers discover products and
                                services while giving participating businesses opportunities
                                to reach potential buyers.
                            </p>
                        </div>

                        <Link
                            href="/services"
                            className="mt-7 inline-flex items-center gap-2 font-bold text-shop-dark-green transition hover:text-shop-darkOrange"
                        >
                            Discover our services
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Our purpose */}
            <section className="bg-slate-50 py-16 sm:py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-shop-darkOrange">
                            Why Airmart?
                        </p>

                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-shop-dark-green sm:text-4xl">
                            Everyday needs deserve a simpler solution.
                        </h2>

                        <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                            Modern life comes with many small tasks. Airmart is being built
                            to make it easier to discover products and supported services
                            through a more connected digital experience.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {benefits.map((benefit) => {
                            const Icon = benefit.icon;

                            return (
                                <article
                                    key={benefit.title}
                                    className="rounded-2xl border border-slate-200/80 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-shop-light-green/15 text-shop-dark-green">
                                        <Icon size={24} />
                                    </div>

                                    <h3 className="mt-5 text-lg font-bold text-slate-900">
                                        {benefit.title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-7 text-slate-600">
                                        {benefit.description}
                                    </p>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Who Airmart is for */}
            <section className="py-16 sm:py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-shop-darkOrange">
                            Who We Serve
                        </p>

                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-shop-dark-green sm:text-4xl">
                            Designed around different everyday needs.
                        </h2>

                        <p className="mt-5 text-base leading-8 text-slate-600">
                            From households and students to everyday shoppers and growing
                            businesses, Airmart is being developed with a range of needs in
                            mind.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {audiences.map((audience) => (
                            <article
                                key={audience.title}
                                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden bg-shop-light-green/15">
                                    <Image
                                        src={audience.image}
                                        alt={audience.alt}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        className="object-cover transition duration-500 group-hover:scale-105"
                                    />
                                </div>

                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-shop-dark-green">
                                        {audience.title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-7 text-slate-600">
                                        {audience.description}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission and vision */}
            <section className="bg-shop-light-green/10 py-16 text-shop-dark-green sm:py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                    <div className="grid gap-6 md:grid-cols-2">

                        {/* Our Mission */}
                        <article className="rounded-2xl border border-shop-dark-green/10 bg-shop-dark-green p-7 text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-9">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-shop-darkOrange text-white">
                                <Target size={25} />
                            </div>

                            <h2 className="mt-6 text-2xl font-bold">Our Mission</h2>

                            <p className="mt-4 leading-8 text-white/85">
                                To make everyday shopping and access to useful services more
                                convenient through technology, while creating opportunities
                                for businesses to connect with customers.
                            </p>
                        </article>

                        {/* Our Vision */}
                        <article className="rounded-2xl border border-shop-dark-green/10 bg-shop-dark-green p-7 text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-9">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-shop-darkOrange text-white">
                                <Eye size={25} />
                            </div>

                            <h2 className="mt-6 text-2xl font-bold">Our Vision</h2>

                            <p className="mt-4 leading-8 text-white/85">
                                To build a trusted and accessible digital commerce ecosystem
                                that connects people, products, businesses, and everyday
                                services across Nigeria.
                            </p>
                        </article>

                    </div>
                </div>
            </section>

            {/* Partnerships */}
            <section className="py-16 sm:py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-shop-darkOrange">
                            Grow With Us
                        </p>

                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-shop-dark-green sm:text-4xl">
                            Be part of the Airmart journey.
                        </h2>

                        <p className="mt-5 leading-8 text-slate-600">
                            We want to build a connected marketplace where customers,
                            businesses, and delivery partners can participate and grow
                            together.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-6 md:grid-cols-2">
                        <article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-7 sm:p-9">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-shop-light-green/15 text-shop-dark-green">
                                <Store size={25} />
                            </div>

                            <h3 className="mt-5 text-2xl font-bold text-shop-dark-green">
                                Become a Vendor
                            </h3>

                            <p className="mt-3 flex-1 leading-7 text-slate-600">
                                Have products you want to sell online? Explore becoming an
                                Airmart vendor and discover how your business can participate
                                in our marketplace.
                            </p>

                            <Link
                                href="/become-a-partner/vendor"
                                className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-full bg-shop-dark-green px-6 py-3 font-semibold text-white transition hover:bg-shop-darkOrange"
                            >
                                Become a Vendor
                                <ArrowRight size={18} />
                            </Link>
                        </article>

                        <article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-7 sm:p-9">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-shop-darkOrange">
                                <Truck size={25} />
                            </div>

                            <h3 className="mt-5 text-2xl font-bold text-shop-dark-green">
                                Become a Rider
                            </h3>

                            <p className="mt-3 flex-1 leading-7 text-slate-600">
                                Interested in supporting deliveries? Explore the opportunity
                                to join the Airmart rider network, subject to available
                                delivery services and requirements.
                            </p>

                            <Link
                                href="/become-a-partner/rider"
                                className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-full bg-shop-dark-green px-6 py-3 font-semibold text-white transition hover:bg-shop-darkOrange"
                            >
                                Become a Rider
                                <ArrowRight size={18} />
                            </Link>
                        </article>
                    </div>
                </div>
            </section>

            <FAQSection faqs={faqs} />

            {/* Final CTA */}
            <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
                <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-shop-dark-green px-6 py-12 text-center sm:px-12 sm:py-16">
                    <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[40px] border-white/5" />
                    <div className="pointer-events-none absolute -bottom-24 -left-12 h-64 w-64 rounded-full border-[40px] border-shop-darkOrange/20" />

                    <div className="relative mx-auto max-w-3xl">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-shop-darkOrange text-white">
                            <Users size={28} />
                        </div>

                        <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Let's make everyday living simpler.
                        </h2>

                        <p className="mt-5 leading-8 text-white/80">
                            Discover available products and services, explore the marketplace,
                            or find out how you can become part of the Airmart community.
                        </p>

                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <Link
                                href="/shop"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-shop-darkOrange px-7 py-3 font-semibold text-white transition hover:bg-orange-600"
                            >
                                Explore the Marketplace
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
            </section>
        </main>
    );
}
