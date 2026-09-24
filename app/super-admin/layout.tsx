import { RoleGuard } from "@/lib/roleGuard";
import { getVisibleNavigation } from "@/lib/dashboardNavigation";
import { superAdminNavigation } from "@/constants/dashboard";
import DashboardLayoutShell from "@/components/dashboard/DashboardLayoutShell";
import type { ReactNode } from "react";

const SuperAdminLayout = async ({ children }: { children: ReactNode }) => {
  const navigation = await getVisibleNavigation(superAdminNavigation);

  return (
    <RoleGuard allowedRoles={["super_admin"]}>
      <DashboardLayoutShell
        navigation={navigation}
        roleTitle="Platform"
        dashboardRoot="/super-admin"
        badgeLabel="Admin"
        badgeColor="bg-purple-50 text-purple-700 border-purple-200"
      >
        {children}
      </DashboardLayoutShell>
    </RoleGuard>
  );
};

export default SuperAdminLayout;
