import Link from "next/link";
import {
    ArrowRight, ArrowLeft,
    CheckCircle2,
    Clock3,
    Smartphone,
} from "lucide-react";
import HeroAppPrevieww from "@/components/landing/HeroAppPrevieww";

export default function DownloadPage() {
    return (
        <main className="relative isolate overflow-hidden bg-white">
            {/* Decorative background */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
            >
                <div className="absolute -right-32 -top-20 h-80 w-80 rounded-full bg-shop-light-green/10 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-shop-darkOrange/10 blur-3xl" />
            </div>

            <section className="mx-auto grid min-h-[70vh] w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
                {/* App information */}
                <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-shop-darkOrange/20 bg-shop-darkOrange/10 px-4 py-2">
                        <Clock3 className="h-4 w-4 text-shop-darkOrange" />
                        <span className="text-xs font-bold uppercase tracking-wider text-shop-dark-green">
                            Coming Soon
                        </span>
                    </div>

                    <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-shop-dark-green sm:text-4xl md:text-5xl">
                        Airmart is coming to your phone.
                    </h1>

                    <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg lg:mx-0">
                        We&apos;re working on the Airmart mobile app to bring shopping,
                        groceries, everyday services, and more into one convenient
                        experience. Our team is working to make your experience worth
                        the wait.
                    </p>

                    <div className="mx-auto mt-7 flex max-w-md flex-col gap-3 text-left sm:max-w-none sm:items-center lg:mx-0 lg:items-start">
                        {[
                            "A convenient shopping experience",
                            "Everyday services in one place",
                            "A simpler way to access Airmart on the go",
                        ].map((item) => (
                            <div key={item} className="flex items-start gap-3">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-shop-light-green" />
                                <span className="text-sm leading-6 text-slate-700 sm:text-base">
                                    {item}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            href="/services"
                            className="hoverEffect inline-flex items-center justify-center gap-2 rounded-xl bg-shop-dark-green px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-shop-dark-green/90 hover:shadow-md"
                        >
                            Explore Airmart
                            <ArrowRight className="h-4 w-4" />
                        </Link>

                        <Link
                            href="/contact"
                            className="hoverEffect inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-shop-dark-green transition-all duration-200 hover:-translate-y-0.5 hover:border-shop-dark-green/40 hover:bg-shop-dark-green/5 hover:shadow-md"
                        >
                            Contact Us
                        </Link>

                        <Link
                            href="/"
                            className="hoverEffect inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-shop-dark-green transition-all duration-200 hover:-translate-y-0.5 hover:border-shop-dark-green/40 hover:bg-shop-dark-green/5 hover:shadow-md"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Link>
                    </div>

                    <p className="mt-5 text-xs leading-5 text-slate-500">
                        The mobile app is still in development. Official download links
                        will be provided when it is ready for release.
                    </p>
                </div>

                {/* Reuse the existing phone mockup */}
                <div className="mx-auto w-full max-w-lg">
                    <div className="relative">
                        <div
                            aria-hidden="true"
                            className="absolute inset-8 rounded-full bg-shop-light-green/10 blur-3xl"
                        />
                        <div className="relative">
                            <HeroAppPrevieww />
                        </div>
                    </div>
                </div>
            </section>

            <div className="border-t border-slate-200/80">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
                    <p className="text-xs text-slate-500 sm:text-sm">
                        One ecosystem. More ways to meet your everyday needs.
                    </p>
                    <p className="text-xs font-semibold text-shop-dark-green sm:text-sm">
                        Value you can trust. Convenience you&apos;ll love.
                    </p>
                </div>
            </div>
        </main>
    );
}
