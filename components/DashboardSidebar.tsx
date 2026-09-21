"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
interface NavigationItem {
  title: string;
  href: string;
}
interface DashboardSidebarProps {
  navigation: NavigationItem[];
}
const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ navigation }) => {
  const pathname = usePathname();
  return (
    <aside className="w-64 border-r border-shop-light-green min-h-[calc(100vh-80px)] p-5">
      {" "}
      <nav className="flex flex-col gap-2">
        {" "}
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-4 py-3 font-medium hover:bg-shop-light-green/10 hover:text-shop-dark-green hoverEffect ${pathname === item.href ? "bg-shop-light-green/10 text-shop-dark-green" : "text-lightColor"}`}
          >
            {" "}
            {item.title}{" "}
          </Link>
        ))}{" "}
      </nav>{" "}
    </aside>
  );
};
export default DashboardSidebar;
