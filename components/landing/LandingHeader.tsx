
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X, ArrowUpRight } from "lucide-react";

import Container from "@/components/Container";
import Logo from "@/components/Logo";

const navItems = [
  { title: "About Us", href: "/about" },
  { title: "Services", href: "/services" },
  { title: "Shop", href: "/shop" },
  { title: "Blog", href: "/blog" },
  { title: "Hot Deal", href: "/deal" },
];

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [partnerOpen, setPartnerOpen] = useState(false);

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setPartnerOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/95 backdrop-blur-md">
      <Container>
        <div className="flex min-h-20 items-center justify-between gap-3 py-3">
          {/* Logo */}
          <div className="shrink-0">
            <Logo onClick={closeMenus} />
          </div>

          {/* Desktop Navigation */}
          <nav
            aria-label="Landing page navigation"
            className="hidden min-w-0 flex-1 items-center justify-center gap-x-4 gap-y-2 lg:flex xl:gap-x-5 2xl:gap-x-6"
          >
            {navItems.slice(0, 3).map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="whitespace-nowrap text-sm font-semibold text-slate-700 transition-colors hover:text-shop-dark-green"
              >
                {item.title}
              </Link>
            ))}

            {/* Become a Partner dropdown */}
            <div
              className="relative shrink-0"
              onMouseEnter={() => setPartnerOpen(true)}
              onMouseLeave={() => setPartnerOpen(false)}
            >
              <button
                type="button"
                aria-expanded={partnerOpen}
                aria-haspopup="true"
                onClick={() => setPartnerOpen((open) => !open)}
                className="flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-slate-700 transition-colors hover:text-shop-dark-green"
              >
                Become a Partner
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-200 ${partnerOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {partnerOpen && (
                <div className="absolute right-0 top-full z-50 w-60 pt-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
                    <Link
                      href="/become-a-partner/vendor"
                      onClick={closeMenus}
                      className="group flex items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-shop-light-green/10"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Become a Vendor
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Grow your business with Airmart
                        </p>
                      </div>
                      <ArrowUpRight
                        size={16}
                        className="text-slate-400 group-hover:text-shop-dark-green"
                      />
                    </Link>

                    <Link
                      href="/become-a-partner"
                      onClick={closeMenus}
                      className="group flex items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-shop-light-green/10"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Become a Rider
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Move with Airmart
                        </p>
                      </div>
                      <ArrowUpRight
                        size={16}
                        className="text-slate-400 group-hover:text-shop-dark-green"
                      />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {navItems.slice(3).map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="whitespace-nowrap text-sm font-semibold text-slate-700 transition-colors hover:text-shop-dark-green"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Desktop app button */}
          <Link
            href="/download"
            className="hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-shop-darkOrange px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-shop-dark-green xl:inline-flex 2xl:px-5"
          >
            Get the App
            <ArrowUpRight size={16} />
          </Link>

          {/* Mobile/tablet menu button */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="landing-mobile-navigation"
            onClick={() => {
              setMobileMenuOpen((open) => !open);
              setPartnerOpen(false);
            }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-shop-light-green/10 text-shop-dark-green transition-colors hover:bg-shop-light-green/20 lg:hidden"
          >
            {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>

        {/* Mobile and tablet navigation */}
        {mobileMenuOpen && (
          <div
            id="landing-mobile-navigation"
            className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-slate-100 py-4 lg:hidden"
          >
            <nav
              aria-label="Mobile landing page navigation"
              className="flex flex-col"
            >
              {navItems.slice(0, 3).map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={closeMenus}
                  className="border-b border-slate-100 px-2 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:text-shop-dark-green"
                >
                  {item.title}
                </Link>
              ))}

              {/* Mobile partner dropdown */}
              <div className="border-b border-slate-100 py-3.5">
                <button
                  type="button"
                  aria-expanded={partnerOpen}
                  onClick={() => setPartnerOpen((open) => !open)}
                  className="flex w-full items-center justify-between px-2 text-left text-sm font-semibold text-slate-700"
                >
                  Become a Partner
                  <ChevronDown
                    size={17}
                    className={`transition-transform duration-200 ${partnerOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {partnerOpen && (
                  <div className="mt-2 space-y-1 pl-3">
                    <Link
                      href="/become-a-partner/vendor"
                      onClick={closeMenus}
                      className="block rounded-lg px-3 py-3 text-sm text-slate-600 hover:bg-shop-light-green/10 hover:text-shop-dark-green"
                    >
                      Become a Vendor
                    </Link>
                    <Link
                      href="/become-a-partner/rider"
                      onClick={closeMenus}
                      className="block rounded-lg px-3 py-3 text-sm text-slate-600 hover:bg-shop-light-green/10 hover:text-shop-dark-green"
                    >
                      Become a Rider
                    </Link>
                  </div>
                )}
              </div>

              {navItems.slice(3).map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={closeMenus}
                  className="border-b border-slate-100 px-2 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:text-shop-dark-green"
                >
                  {item.title}
                </Link>
              ))}

              <Link
                href="/download"
                onClick={closeMenus}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-shop-dark-green px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-shop-darkOrange"
              >
                Get the App
                <ArrowUpRight size={16} />
              </Link>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}
