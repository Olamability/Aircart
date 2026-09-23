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
    <div className="flex h-full flex-col justify-between p-5">
      {" "}
      <div className="space-y-6">
        {" "}
        {/* Brand & Context Header */}{" "}
        <div>
          {" "}
          <div className="flex items-center justify-between">
            {" "}
            <Link
              href={dashboardRoot}
              onClick={onNavigate}
              className="text-xl font-bold tracking-tight text-shop-dark-green flex items-center gap-2"
            >
              {" "}
              <span>
                {" "}
                <Logo />{" "}
              </span>{" "}
              {onNavigate && (
                <button
                  type="button"
                  onClick={onNavigate}
                  className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  {" "}
                  <X className="h-5 w-5" />{" "}
                </button>
              )}{" "}
            </Link>{" "}
          </div>{" "}
          <div className="mt-2.5 flex items-center gap-2">
            {" "}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${badgeColor}`}
            >
              {" "}
              {badgeLabel}{" "}
            </span>{" "}
          </div>{" "}
        </div>{" "}
        {/* Return to Public Marketplace Quick Link */}{" "}
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center justify-between rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/60 hover:text-shop-dark-green transition group"
        >
          {" "}
          <div className="flex items-center gap-2">
            {" "}
            <Store className="h-4 w-4 text-emerald-600 shrink-0" />{" "}
            <span>Marketplace Home</span>{" "}
          </div>{" "}
          <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-shop-dark-green transition" />{" "}
        </Link>{" "}
        {/* Navigation Links */}{" "}
        <div className="space-y-1">
          {" "}
          <span className="block px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            {" "}
            {roleTitle} Navigation{" "}
          </span>{" "}
          <nav className="flex flex-col gap-1">
            {" "}
            {navigation.map((item) => {
              const Icon = iconMap[item.title] || LayoutDashboard;
              const active = isCurrentActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition duration-150 ${active ? "bg-shop-dark-green text-white font-semibold shadow-xs" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
                >
                  {" "}
                  <div className="flex items-center gap-2.5 truncate">
                    {" "}
                    <Icon
                      className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-slate-400"}`}
                    />{" "}
                    <span className="truncate">{item.title}</span>{" "}
                  </div>{" "}
                  {active && (
                    <ChevronRight className="h-3 w-3 opacity-60 shrink-0" />
                  )}{" "}
                </Link>
              );
            })}{" "}
          </nav>{" "}
        </div>{" "}
      </div>{" "}
      {/* Sidebar Footer */}{" "}
      <div className="border-t border-slate-200 pt-4 space-y-3">
        {" "}
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-shop-dark-green transition px-2"
        >
          {" "}
          <Home className="h-3.5 w-3.5 text-slate-400" />{" "}
          <span>Go to Customer Storefront</span>{" "}
        </Link>{" "}
        <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-100">
          {" "}
          <span className="text-[11px] text-slate-400">
            Manage Session
          </span>{" "}
          <UserButton />{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
const DashboardLayoutShell: React.FC<DashboardLayoutShellProps> = ({
  navigation,
  roleTitle,
  dashboardRoot,
  badgeLabel,
  badgeColor = "bg-emerald-50 text-shop-dark-green border-emerald-200",
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {" "}
      {/* Desktop Fixed Sidebar */}{" "}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white sticky top-0 h-screen z-30">
        {" "}
        <SidebarContent
          navigation={navigation}
          roleTitle={roleTitle}
          dashboardRoot={dashboardRoot}
          badgeLabel={badgeLabel}
          badgeColor={badgeColor}
          pathname={pathname}
        />{" "}
      </aside>{" "}
      {/* Mobile Slide-Over Drawer */}{" "}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {" "}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />{" "}
          <div className="fixed inset-y-0 left-0 w-72 max-w-full bg-white shadow-xl z-50">
            {" "}
            <SidebarContent
              navigation={navigation}
              roleTitle={roleTitle}
              dashboardRoot={dashboardRoot}
              badgeLabel={badgeLabel}
              badgeColor={badgeColor}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* Main Content Area */}{" "}
      <div className="flex flex-1 flex-col min-w-0">
        {" "}
        {/* Sticky Dashboard Top Navigation Bar */}{" "}
        <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-6">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            {/* Mobile Hamburger Toggle */}{" "}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              aria-label="Open Navigation Menu"
            >
              {" "}
              <Menu className="h-5 w-5" />{" "}
            </button>{" "}
            {/* Breadcrumb Navigation */} <Breadcrumbs />{" "}
          </div>{" "}
          {/* Right Top Bar Utilities */}{" "}
          <div className="flex items-center gap-3">
            {" "}
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition"
            >
              {" "}
              <Store className="h-3.5 w-3.5 text-emerald-600" />{" "}
              <span>Public Storefront</span>{" "}
            </Link>{" "}
            <span
              className={`hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badgeColor}`}
            >
              {" "}
              {badgeLabel}{" "}
            </span>{" "}
            <div className="pl-1 border-l border-slate-200">
              {" "}
              <UserButton />{" "}
            </div>{" "}
          </div>{" "}
        </header>{" "}
        {/* Main Body */}{" "}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {" "}
          {children}{" "}
        </main>{" "}
      </div>{" "}
    </div>
  );
};
export default DashboardLayoutShell;
