
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    BriefcaseBusiness,
    Mail,
} from "lucide-react";

export default function BecomeAPartnerPage() {
    return (
        <main className="relative isolate flex min-h-[65vh] items-center justify-center overflow-hidden bg-slate-50 px-4 py-16 sm:px-6 lg:py-24">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-20 -z-10 h-72 w-72 rounded-full bg-shop-light-green/10 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-20 -left-20 -z-10 h-72 w-72 rounded-full bg-shop-darkOrange/10 blur-3xl"
            />

            <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10 lg:p-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-shop-light-green/10 text-shop-dark-green">
                    <BriefcaseBusiness className="h-8 w-8" />
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-shop-darkOrange sm:text-sm">
                    Partner Opportunities
                </p>

                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-shop-dark-green sm:text-4xl">
                    New opportunities are coming.
                </h1>

                <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                    Thank you for your interest in partnering with Spaazr. We are
                    currently preparing for our next phase of growth, and there are
                    no new partner or rider opportunities available at this time.
                </p>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
                    Please check back later or contact our team if you have an enquiry
                    about working with us.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        href="/contact"
                        className="hoverEffect inline-flex items-center justify-center gap-2 rounded-xl bg-shop-dark-green px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-shop-dark-green/90 hover:shadow-md"
                    >
                        <Mail className="h-4 w-4" />
                        Contact Our Team
                        <ArrowRight className="h-4 w-4" />
                    </Link>

                    <Link
                        href="/"
                        className="hoverEffect inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-shop-dark-green transition-all duration-200 hover:-translate-y-0.5 hover:border-shop-dark-green/40 hover:bg-shop-dark-green/5 hover:shadow-md"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-5">
                    <p className="text-xs leading-5 text-slate-500">
                        We appreciate your interest in being part of the Spaazr
                        ecosystem.
                    </p>
                </div>
            </section>
        </main>
    );
}
