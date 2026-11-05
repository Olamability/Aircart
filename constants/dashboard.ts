
import { permissions } from "@/lib/permissions";

export const adminNavigation = [
  { title: "Dashboard", href: "/admin" },
  {
    title: "Products",
    href: "/admin/products",
    permission: permissions.products_view,
  },
  {
    title: "Inventory",
    href: "/admin/inventory",
    permission: permissions.inventory_view,
  },
  {
    title: "Vendors",
    href: "/admin/vendors",
    permission: permissions.vendors_view,
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
    title: "Categories",
    href: "/admin/categories",
    permission: permissions.categories_view,
  },
  {
    title: "Brands",
    href: "/admin/brands",
    permission: permissions.brands_view,
  },
  {
    title: "Services",
    href: "/admin/services",
    permission: permissions.services_view,
  },
  {
    title: "Approvals",
    href: "/admin/approvals",
    permission: permissions.approvals_view,
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    permission: permissions.reviews_view,
  },
  {
    title: "Transactions",
    href: "/admin/transactions",
    permission: permissions.transactions_view,
  },
  {
    title: "Compliance",
    href: "/admin/compliance",
    permission: permissions.compliance_view,
  },
  {
    title: "Disputes",
    href: "/admin/disputes",
    permission: permissions.disputes_view,
  },
];

export const vendorNavigation = [
  { title: "Dashboard", href: "/vendor" },
  {
    title: "Products",
    href: "/vendor/products",
    permission: permissions.products_view,
  },
  {
    title: "Orders",
    href: "/vendor/orders",
    permission: permissions.orders_view,
  },
  {
    title: "Inventory",
    href: "/vendor/inventory",
    permission: permissions.inventory_view,
  },
  {
    title: "Shipping",
    href: "/vendor/shipping",
    permission: permissions.shipping_view,
  },
  {
    title: "Telemetry",
    href: "/vendor/telemetry",
    permission: permissions.telemetry_view,
  },
  {
    title: "Ledger",
    href: "/vendor/ledger",
    permission: permissions.ledger_view,
  },
  {
    title: "Store Profile",
    href: "/vendor/profile",
    permission: permissions.vendor_profile_view,
  },
];

export const superAdminNavigation = [
  { title: "Dashboard", href: "/super-admin" },
  {
    title: "Platform Metrics",
    href: "/super-admin/metrics",
    permission: permissions.platform_metrics,
  },
  {
    title: "Transaction Fees",
    href: "/super-admin/fees",
    permission: permissions.platform_fees,
  },
  {
    title: "Vendor Ledger",
    href: "/super-admin/ledger",
    permission: permissions.platform_fees,
  },
  {
    title: "Users",
    href: "/super-admin/users",
    permission: permissions.admin_manage,
  },
  {
    title: "Admins",
    href: "/super-admin/admins",
    permission: permissions.admin_manage,
  },
  {
    title: "Vendor Approvals",
    href: "/super-admin/approvals",
    permission: permissions.approvals_view,
  },
  {
    title: "Products",
    href: "/admin/products",
    permission: permissions.products_view,
  },
  {
    title: "Inventory",
    href: "/admin/inventory",
    permission: permissions.inventory_view,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    permission: permissions.orders_view,
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    permission: permissions.reviews_view,
  },
  {
    title: "Transactions",
    href: "/admin/transactions",
    permission: permissions.transactions_view,
  },
  {
    title: "Disputes & Claims",
    href: "/admin/disputes",
    permission: permissions.disputes_view,
  },
  {
    title: "Role Delegation",
    href: "/super-admin/roles",
    permission: permissions.role_delegation,
  },
  {
    title: "Global Webhooks",
    href: "/super-admin/webhooks",
    permission: permissions.webhooks_manage,
  },
  {
    title: "System Settings",
    href: "/super-admin/settings",
    permission: permissions.platform_settings,
  },
];
