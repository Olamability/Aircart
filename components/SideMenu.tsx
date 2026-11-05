
"use client";

import React, { FC, useEffect } from "react";
import { X, LayoutDashboard } from "lucide-react";
import { headerData } from "@/constants/data";
import Link from "next/link";
import Logo from "./Logo";
import { usePathname } from "next/navigation";
import SocialMedia from "./SocialMedia";
import { useUser } from "@clerk/nextjs";
import SignIn from "./SignIn";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardHref?: string | null;
  dashboardLabel?: string | null;
}

const SideMenu: FC<SidebarProps> = ({
  isOpen,
  onClose,
  dashboardHref,
  dashboardLabel,
}) => {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();

  // Prevent background scrolling while the menu is open
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    // Close menu when Escape is pressed
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Fallback role resolution from client metadata if not passed from server
  let effectiveDashboardHref = dashboardHref;
  let effectiveDashboardLabel = dashboardLabel;

  if (!effectiveDashboardHref && user) {
    const role = user.publicMetadata?.role as string | undefined;

    if (role === "vendor") {
      effectiveDashboardHref = "/vendor";
      effectiveDashboardLabel = "Vendor Dashboard";
    } else if (role === "product_manager") {
      effectiveDashboardHref = "/admin/products";
      effectiveDashboardLabel = "Product Manager Dashboard";
    } else if (role === "admin") {
      effectiveDashboardHref = "/admin";
      effectiveDashboardLabel = "Admin Dashboard";
    } else if (role === "super_admin") {
      effectiveDashboardHref = "/super-admin";
      effectiveDashboardLabel = "Super Admin";
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[100] md:hidden ${isOpen
          ? "pointer-events-auto visible"
          : "pointer-events-none invisible"
        }`}
      aria-hidden={!isOpen}
    >
      {/* Background overlay with blur */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isOpen ? "opacity-100" : "opacity-0"
          }`}
        aria-hidden="true"
      />

      {/* Sliding navigation drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
        className={`absolute left-0 top-0 flex h-[100dvh] w-[70vw] max-w-[360px] min-w-[260px] flex-col gap-6 overflow-y-auto border-r border-shop-light-green bg-black p-6 text-white shadow-2xl transition-transform duration-300 ease-in-out sm:p-8 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Logo and close button */}
        <div className="flex items-center justify-between gap-5">
          <Logo
            className="text-white"
            spanDesign="group-hover:text-white"
          />

          <button
            onClick={onClose}
            className="rounded-full p-2 text-white transition-colors hover:bg-white/10 hover:text-shop-light-green"
            aria-label="Close Mobile Menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dashboard shortcut */}
        {effectiveDashboardHref && (
          <Link
            href={effectiveDashboardHref}
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg border border-shop-light-green/40 bg-shop-light-green/20 px-3.5 py-2.5 text-xs font-semibold text-shop-light-green transition hover:bg-shop-light-green hover:text-white"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>
              {effectiveDashboardLabel || "Go to Dashboard"}
            </span>
          </Link>
        )}

        {/* Navigation links */}
        <nav className="flex flex-col space-y-3.5 font-semibold tracking-wide">
          {headerData?.map((item) => (
            <Link
              href={item?.href}
              key={item?.title}
              onClick={onClose}
              aria-current={
                pathname === item?.href ? "page" : undefined
              }
              className={`transition-colors hover:text-shop-light-green ${pathname === item?.href
                  ? "text-shop-light-green"
                  : "text-white/80"
                }`}
            >
              {item?.title}
            </Link>
          ))}

          <hr className="my-2 border-gray-800" />

          {isSignedIn ? (
            <>
              <Link
                href="/account"
                onClick={onClose}
                className="text-white/80 transition-colors hover:text-shop-light-green"
              >
                My Account
              </Link>

              <Link
                href="/orders"
                onClick={onClose}
                className="text-white/80 transition-colors hover:text-shop-light-green"
              >
                My Orders
              </Link>

              <Link
                href="/account"
                onClick={onClose}
                className="text-white/80 transition-colors hover:text-shop-light-green"
              >
                Delivery Addresses
              </Link>
            </>
          ) : (
            <SignIn />
          )}
        </nav>

        {/* Social media links */}
        <div className="mt-auto pt-4">
          <SocialMedia />
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
