import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SanityLive } from "@/sanity/lib/live";

export const metadata: Metadata = {
  title: {
    template: "%s - Airmart online store",
    default: "Airmart online store",
  },
  description:
    "Airmart online store, the best place to buy your favorite products online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <SanityLive />
    </div>
  );
}
