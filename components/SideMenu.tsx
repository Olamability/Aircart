import { X, LayoutDashboard } from "lucide-react";
import { headerData } from "@/constants/data";
import Link from "next/link";
import Logo from "./Logo";
import React, { FC } from "react";
import { useOutsideClick } from "@/hooks";
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
  const sidebarRef = useOutsideClick<HTMLDivElement>(onClose);
  const { isSignedIn, user } = useUser();

  // Fallback role resolution from client metadata if not passed from server
  let effectiveDashboardHref = dashboardHref;
  let effectiveDashboardLabel = dashboardLabel;

  if (!effectiveDashboardHref && user) {
    const role = user.publicMetadata?.role as string | undefined;
    if (role === "vendor") {
      effectiveDashboardHref = "/vendor";
      effectiveDashboardLabel = "Vendor Dashboard";
    } else if (role === "admin" || role === "product_manager") {
      effectiveDashboardHref = "/admin";
      effectiveDashboardLabel = "Admin Dashboard";
    } else if (role === "super_admin") {
      effectiveDashboardHref = "/super-admin";
      effectiveDashboardLabel = "Super Admin";
    }
  }

  return (
    <div
      className={`fixed inset-y-0 h-screen left-0 z-50 w-full
      bg-black/50 text-white/70 shadow-xl ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } hoverEffect`}
    >
      <div
        ref={sidebarRef}
        className="min-w-72 max-w-96 bg-black text-white h-screen p-10
      border-r border-r-shop-light-green flex flex-col gap-6 overflow-y-auto"
      >
        <div className="flex items-center justify-between gap-5">
          <Logo className="text-white" spanDesign="group-hover:text-white" />
          <button
            onClick={onClose}
            className="hover:text-shop-light-green hoverEffect"
            aria-label="Close Mobile Menu"
          >
            <X />
          </button>
        </div>

        {effectiveDashboardHref && (
          <Link
            href={effectiveDashboardHref}
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg bg-shop-light-green/20 border border-shop-light-green/40 px-3.5 py-2.5 text-xs font-semibold text-shop-light-green hover:bg-shop-light-green hover:text-white transition"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>{effectiveDashboardLabel || "Go to Dashboard"}</span>
          </Link>
        )}

        <div className="flex flex-col space-y-3.5 font-semibold tracking-wide">
          {headerData?.map((item) => (
            <Link
              href={item?.href}
              key={item?.title}
              onClick={onClose}
              className={`hover:text-shop-light-green
          hoverEffect ${pathname === item?.href && "text-shop-light-green"}`}
            >
              {item?.title}
            </Link>
          ))}
          <hr className="border-gray-800 my-2" />
          {isSignedIn ? (
            <>
              <Link
                href="/account"
                onClick={onClose}
                className="hover:text-shop-light-green hoverEffect"
              >
                My Account
              </Link>
              <Link
                href="/orders"
                onClick={onClose}
                className="hover:text-shop-light-green hoverEffect"
              >
                My Orders
              </Link>
              <Link
                href="/account"
                onClick={onClose}
                className="hover:text-shop-light-green hoverEffect"
              >
                Delivery Addresses
              </Link>
            </>
          ) : (
            <SignIn />
          )}
        </div>
        <SocialMedia />
      </div>
    </div>
  );
};

export default SideMenu;
