import { RoleGuard } from "@/lib/roleGuard";
import { getVisibleNavigation } from "@/lib/dashboardNavigation";
import { adminNavigation } from "@/constants/dashboard";
import DashboardLayoutShell from "@/components/dashboard/DashboardLayoutShell";
import type { ReactNode } from "react";

const AdminLayout = async ({ children }: { children: ReactNode }) => {
  const navigation = await getVisibleNavigation(adminNavigation);

  return (
    <RoleGuard allowedRoles={["admin", "super_admin"]}>
      <DashboardLayoutShell
        navigation={navigation}
        roleTitle="Admin"
        dashboardRoot="/admin"
        badgeLabel="Admin"
        badgeColor="bg-emerald-50 text-shop-dark-green border-emerald-200"
      >
        {children}
      </DashboardLayoutShell>
    </RoleGuard>
  );
};

export default AdminLayout;
