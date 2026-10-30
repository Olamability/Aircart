
"use client";

import { useState } from "react";

export interface FAQItem {
    question: string;
    answer: string;
}

interface FAQSectionProps {
    faqs?: FAQItem[];
    eyebrow?: string;
    title?: string;
    description?: string;
    className?: string;
    defaultOpenIndex?: number;
}

export default function FAQSection({
    faqs = [],
    eyebrow = "FAQs",
    title = "Frequently Asked Questions",
    description = "Find out more about Spaazr, our platform, and how to get involved.",
    className = "",
    defaultOpenIndex = 0,
}: FAQSectionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(
        defaultOpenIndex >= 0 && defaultOpenIndex < faqs.length
            ? defaultOpenIndex
            : null
    );

    if (faqs.length === 0) {
        return null;
    }

    return (
        <section
            className={`border-t border-slate-200/80 bg-slate-50 py-12 sm:py-16 lg:py-20 ${className}`}
        >
            <div className="mx-auto max-w-4xl px-4 sm:px-8">
                <div className="text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-shop-darkOrange sm:text-sm">
                        {eyebrow}
                    </p>

                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-shop-dark-green sm:mt-4 sm:text-3xl md:text-4xl">
                        {title}
                    </h2>

                    {description && (
                        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:mt-4 sm:text-base">
                            {description}
                        </p>
                    )}
                </div>

                <div className="mt-7 space-y-3 sm:mt-10">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <details
                                key={faq.question}
                                open={isOpen}
                                className="group rounded-2xl border border-slate-200 bg-white p-4 transition-colors duration-200 open:border-shop-dark-green/20 sm:p-6"
                            >
                                <summary
                                    onClick={(event) => {
                                        event.preventDefault();
                                        setOpenIndex(isOpen ? null : index);
                                    }}
                                    className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden"
                                >
                                    <span className="text-sm leading-6 sm:text-base">
                                        {faq.question}
                                    </span>

                                    <span
                                        aria-hidden="true"
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${isOpen
                                                ? "rotate-45 bg-shop-dark-green text-white"
                                                : "bg-shop-light-green/15 text-shop-dark-green"
                                            }`}
                                    >
                                        <span className="text-xl leading-none">+</span>
                                    </span>
                                </summary>

                                {isOpen && (
                                    <div className="mt-4 border-t border-slate-100 pt-4">
                                        <p className="pr-1 text-sm leading-7 text-slate-600">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </details>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
