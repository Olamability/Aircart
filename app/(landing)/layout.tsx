import type { ReactNode } from "react";
import "../../app/globals.css";
import { SanityLive } from "@/sanity/lib/live";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HomeBanner from "@/components/HomeBanner";
import LandingHeader from "@/components/landing/LandingHeader";

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <LandingHeader />

      <main className="flex-1">{children}</main>

      <Footer />


      <SanityLive />
    </div>
  );
}
