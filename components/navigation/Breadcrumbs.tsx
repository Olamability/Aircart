"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent: boolean;
}

const segmentLabelMap: Record<string, string> = {
  admin: "Admin Console",
  vendor: "Vendor Portal",
  "super-admin": "Super Admin",
  products: "Products",
  new: "Add Product",
  edit: "Edit Product",
  inventory: "Inventory",
  orders: "Orders",
  shipping: "Shipping",
  telemetry: "Telemetry",
  ledger: "Ledger",
  profile: "Store Profile",
  vendors: "Vendors",
  customers: "Customers",
  categories: "Categories",
  brands: "Brands",
  services: "Services",
  approvals: "Approvals",
  transactions: "Transactions",
  compliance: "Compliance",
  disputes: "Disputes",
  metrics: "Platform Metrics",
  fees: "Transaction Fees",
  admins: "Admins",
  roles: "Role Delegation",
  webhooks: "Global Webhooks",
  settings: "System Settings",
};

const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();

  // If on public root, no dashboard breadcrumbs needed
  if (!pathname || pathname === "/") return null;

  const rawSegments = pathname.split("/").filter(Boolean);

  const items: BreadcrumbItem[] = [
    {
      label: "Marketplace",
      href: "/",
      isCurrent: false,
    },
  ];

  let accumulatedPath = "";

  rawSegments.forEach((segment, index) => {
    accumulatedPath += `/${segment}`;
    const isLast = index === rawSegments.length - 1;

    let label = segmentLabelMap[segment.toLowerCase()];

    if (!label) {
      // Check if this looks like a Sanity ID or slug
      if (segment.length > 15 || segment.includes("-") || segment.includes("_")) {
        // If next segment is 'edit', this is an ID, label as 'Item'
        if (rawSegments[index + 1] === "edit") {
          label = "Item Details";
        } else {
          label = "Details";
        }
      } else {
        label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
      }
    }

    items.push({
      label,
      href: accumulatedPath,
      isCurrent: isLast,
    });
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 overflow-x-auto py-1">
      <ol className="flex items-center gap-1.5 whitespace-nowrap">
        {items.map((item, idx) => {
          const isFirst = idx === 0;

          return (
            <li key={item.href} className="flex items-center gap-1.5">
              {!isFirst && (
                <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" aria-hidden="true" />
              )}

              {item.isCurrent ? (
                <span
                  className="font-semibold text-slate-800"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-slate-500 hover:text-shop-dark-green hover:underline transition"
                >
                  {isFirst && <Home className="h-3.5 w-3.5 shrink-0" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
