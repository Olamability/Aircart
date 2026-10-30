import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import Container from "@/components/Container";
import Logo from "@/components/Logo";

const footerLinks = {
  Company: [
    { title: "About Us", href: "/about" },
    { title: "Services", href: "/services" },
    { title: "Contact", href: "/contact" },
  ],
  Partners: [
    { title: "Become a Vendor", href: "/become-a-partner/vendor" },
    { title: "Become a Rider", href: "/become-a-partner/rider" },
  ],
};

export default function LandingFooter() {
  return (
    <footer className="border-t border-shop-dark-green/10 bg-slate-600 text-white">
      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4 lg:py-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="inline-flex">
              <Logo />
            </div>

            <p className="mt-5 max-w-md text-sm leading-6 text-white/65">
              A smarter everyday platform connecting shopping, services,
              payments and delivery in one convenient experience.
            </p>

            <Link
              href="/download"
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-shop-darkOrange px-5 py-3 text-sm font-semibold text-shop-dark-green transition-colors hover:bg-white"
            >
              Get the Spaazr App
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          {/* Company */}
          <div>
            <h2 className="text-sm font-semibold text-white">Company</h2>

            <ul className="mt-5 space-y-3">
              {footerLinks.Company.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-shop-lighter-green"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partners */}
          <div>
            <h2 className="text-sm font-semibold text-white">
              Partner with us
            </h2>

            <ul className="mt-5 space-y-3">
              {footerLinks.Partners.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-shop-lighter-green"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-5 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Spaazr. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="#"
              aria-label="Instagram"
              className="text-xs font-semibold text-white/50 transition-colors hover:text-shop-lighter-green"
            >
              Instagram
            </a>

            <a
              href="#"
              aria-label="LinkedIn"
              className="text-xs font-semibold text-white/50 transition-colors hover:text-shop-lighter-green"
            >
              LinkedIn
            </a>

            <a
              href="#"
              aria-label="Twitter"
              className="text-xs font-semibold text-white/50 transition-colors hover:text-shop-lighter-green"
            >
              Twitter
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
