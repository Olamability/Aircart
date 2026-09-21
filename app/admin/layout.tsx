import { RoleGuard } from "@/lib/roleGuard";
import { getVisibleNavigation } from "@/lib/dashboardNavigation";
import { adminNavigation } from "@/constants/dashboard";
import DashboardSidebar from "@/components/DashboardSidebar";
import type { ReactNode } from "react";
const AdminLayout = async ({ children }: { children: ReactNode }) => {
  const navigation = await getVisibleNavigation(adminNavigation);
  return (
    <RoleGuard allowedRoles={["admin", "super_admin"]}>
      {" "}
      <div className="flex min-h-screen">
        {" "}
        <DashboardSidebar navigation={navigation} />{" "}
        <main className="flex-1 p-6">{children}</main>{" "}
      </div>{" "}
    </RoleGuard>
  );
};
export default AdminLayout;
