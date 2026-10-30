
"use client";

import React, { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  Menu,
  X,
  Home,
  Store,
  ExternalLink,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FolderTree,
  Tag,
  Sparkles,
  ShieldCheck,
  CreditCard,
  ShieldAlert,
  MessageSquareWarning,
  Warehouse,
  Truck,
  TrendingUp,
  Wallet,
  UserCheck,
  Percent,
  UserPlus,
  Key,
  Webhook,
  Sliders,
  ChevronRight,
  LucideIcon,
} from "lucide-react";

import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import Logo from "../Logo";

interface NavigationItem {
  title: string;
  href: string;
}

interface DashboardLayoutShellProps {
  navigation: NavigationItem[];
  roleTitle: string;
  dashboardRoot: string;
  badgeLabel: string;
  badgeColor?: string;
  vendorStoreUrl?: string | null;
  children: ReactNode;
}

interface SidebarContentProps {
  navigation: NavigationItem[];
  roleTitle: string;
  dashboardRoot: string;
  badgeLabel: string;
  badgeColor: string;
  pathname: string;
  onNavigate?: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  Dashboard: LayoutDashboard,
  Products: Package,
  "My Products": Package,
  Vendors: Store,
  Orders: ShoppingBag,
  "My Orders": ShoppingBag,
  Customers: Users,
  Categories: FolderTree,
  Brands: Tag,
  Services: Sparkles,
  Approvals: ShieldCheck,
  Transactions: CreditCard,
  Compliance: ShieldAlert,
  Disputes: MessageSquareWarning,
  Inventory: Warehouse,
  Shipping: Truck,
  Telemetry: TrendingUp,
  Ledger: Wallet,
  "Store Profile": UserCheck,
  "My Profile": UserCheck,
  "Platform Metrics": TrendingUp,
  "Transaction Fees": Percent,
  Admins: UserPlus,
  "Role Delegation": Key,
  "Global Webhooks": Webhook,
  "System Settings": Sliders,
};

const SidebarContent: React.FC<SidebarContentProps> = ({
  navigation,
  roleTitle,
  dashboardRoot,
  badgeLabel,
  badgeColor,
  pathname,
  onNavigate,
}) => {
  const isCurrentActive = (href: string) => {
    if (href === dashboardRoot) {
      return pathname === dashboardRoot;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Brand Header */}
      <div className="border-b border-slate-100 px-5 pb-5 pt-6">
        <div className="flex items-center justify-between">
          <Logo href="/" onClick={onNavigate} />

          {onNavigate && (
            <button
              type="button"
              onClick={onNavigate}
              aria-label="Close navigation menu"
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#063C28] text-white">
            <LayoutDashboard className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-800">
              {roleTitle}
            </p>

            <span
              className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}
            >
              {badgeLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Public Storefront Link */}
      <div className="px-4 pt-5">
        <Link
          href="/shop"
          onClick={onNavigate}
          className="group flex items-center justify-between rounded-xl border border-dashed border-[#DCE7DF] bg-[#F6F9F6] px-3.5 py-3 transition hover:border-[#3B9C3C] hover:bg-[#EDF5EE]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#063C28] shadow-sm">
              <Store className="h-4 w-4" />
            </div>

            <div>
              <p className="text-xs font-bold text-[#063C28]">
                Marketplace Home
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Visit public storefront
              </p>
            </div>
          </div>

          <ExternalLink className="h-3.5 w-3.5 text-slate-400 transition group-hover:text-[#063C28]" />
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 pb-5 pt-7">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          {roleTitle} Navigation
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = iconMap[item.title] || LayoutDashboard;
            const active = isCurrentActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`group relative flex min-h-11 items-center justify-between rounded-xl px-3.5 py-3 text-sm transition-all duration-200 ${active
                  ? "bg-[#063C28] font-semibold text-white shadow-sm"
                  : "text-slate-600 hover:bg-[#F3F7F3] hover:text-[#063C28]"
                  }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 transition-colors ${active
                      ? "text-[#F28C28]"
                      : "text-slate-400 group-hover:text-[#063C28]"
                      }`}
                  />

                  <span className="truncate">{item.title}</span>
                </div>

                {active && (
                  <ChevronRight className="h-4 w-4 shrink-0 text-white/70" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="border-t border-slate-100 bg-[#FCFDFC] px-5 pb-5 pt-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-2 py-2 text-xs font-medium text-slate-500 transition hover:text-[#063C28]"
        >
          <Home className="h-4 w-4 text-slate-400" />
          <span>Go to Customer Storefront</span>
        </Link>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs font-semibold text-slate-700">
              Manage Session
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              Account & security
            </p>
          </div>

          <UserButton />
        </div>
      </div>
    </div>
  );
};

const DashboardLayoutShell: React.FC<DashboardLayoutShellProps> = ({
  navigation,
  roleTitle,
  dashboardRoot,
  badgeLabel,
  badgeColor = "bg-emerald-50 text-[#063C28] border-emerald-200",
  vendorStoreUrl = null,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#F5F7F5]">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 z-30 hidden h-screen w-[270px] shrink-0 flex-col border-r border-slate-200/80 bg-white lg:flex">
        <SidebarContent
          navigation={navigation}
          roleTitle={roleTitle}
          dashboardRoot={dashboardRoot}
          badgeLabel={badgeLabel}
          badgeColor={badgeColor}
          pathname={pathname}
        />
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="fixed inset-y-0 left-0 z-50 w-[290px] max-w-[85vw] animate-in slide-in-from-left duration-200">
            <SidebarContent
              navigation={navigation}
              roleTitle={roleTitle}
              dashboardRoot={dashboardRoot}
              badgeLabel={badgeLabel}
              badgeColor={badgeColor}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main Dashboard */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-[72px] w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              className="rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-[#063C28] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <Breadcrumbs />
            </div>
          </div>

          {/* Header Utilities */}
          <div className="ml-3 flex shrink-0 items-center gap-3">
            {vendorStoreUrl && (
              <Link
                href={vendorStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-[#B8D1BE] hover:bg-[#F6F9F6] hover:text-[#063C28] sm:inline-flex"
              >
                <Store className="h-4 w-4 text-[#3B9C3C]" />
                <span>Public Storefront</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </Link>
            )}

            <span
              className={`hidden items-center rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider md:inline-flex ${badgeColor}`}
            >
              {badgeLabel}
            </span>

            <div className="border-l border-slate-200 pl-3">
              <UserButton />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="w-full min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayoutShell;
