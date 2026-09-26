import { RoleGuard } from "@/lib/roleGuard";
import { getVisibleNavigation } from "@/lib/dashboardNavigation";
import { adminNavigation } from "@/constants/dashboard";
import DashboardLayoutShell from "@/components/dashboard/DashboardLayoutShell";
import { getUserRole } from "@/lib/roles";
import type { ReactNode } from "react";

const AdminLayout = async ({ children }: { children: ReactNode }) => {
  const [navigation, role] = await Promise.all([
    getVisibleNavigation(adminNavigation),
    getUserRole(),
  ]);

  const isProductManager = role === "product_manager";
  const visibleNav = isProductManager
    ? navigation.filter((item) => item.href !== "/admin")
    : navigation;

  return (
    <RoleGuard allowedRoles={["admin", "super_admin", "product_manager"]}>
      <DashboardLayoutShell
        navigation={visibleNav}
        roleTitle={isProductManager ? "Product Manager" : "Admin"}
        dashboardRoot={isProductManager ? "/admin/products" : "/admin"}
        badgeLabel={isProductManager ? "Product Manager" : "Admin"}
        badgeColor={
          isProductManager
            ? "bg-sky-50 text-sky-700 border-sky-200"
            : "bg-emerald-50 text-shop-dark-green border-emerald-200"
        }
      >
        {children}
      </DashboardLayoutShell>
    </RoleGuard>
  );
};

export default AdminLayout;
