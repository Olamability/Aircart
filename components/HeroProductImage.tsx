"use client";

import Image from "next/image";
import Hero from "@/public/Images/Ryan.jpeg";

export default function HeroProductImage() {
    return (
        <div className="absolute bottom-0 right-0 hidden h-full w-[55%] items-end justify-end sm:right-2 sm:flex sm:w-[52%] md:right-4 md:w-[50%] lg:right-8 lg:w-[48%]">
            <div className="relative flex h-[105%] w-full items-end justify-center">
                <div className="absolute bottom-4 h-32 w-56 rounded-full bg-white/50 blur-2xl sm:h-40 sm:w-64" />

                <Image
                    src={Hero}
                    alt="Featured product"
                    width={800}
                    height={800}
                    priority
                    className="relative z-10 h-full w-auto max-w-none rounded-2xl object-contain drop-shadow-[0_18px_24px_rgba(6,60,40,0.16)] transition-transform duration-500 hover:scale-105"
                />
            </div>
        </div>

    );
}