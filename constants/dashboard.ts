import { permissions } from "@/lib/permissions";
export const adminNavigation = [
  { title: "Dashboard", href: "/admin" },
  {
    title: "Products",
    href: "/admin/products",
    permission: permissions.products_view,
  },
  {
    title: "Vendors",
    href: "/admin/vendors",
    permission: permissions.vendors_view,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    permission: permissions.categories_view,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    permission: permissions.orders_view,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    permission: permissions.customers_view,
  },
  {
    title: "Services",
    href: "/admin/services",
    permission: permissions.services_view,
  },
];
export const vendorNavigation = [
  { title: "Dashboard", href: "/vendor" },
  {
    title: "My Products",
    href: "/vendor/products",
    permission: permissions.products_view,
  },
  {
    title: "My Orders",
    href: "/vendor/orders",
    permission: permissions.orders_view,
  },
  {
    title: "My Profile",
    href: "/vendor/profile",
    permission: permissions.vendor_profile_view,
  },
];
