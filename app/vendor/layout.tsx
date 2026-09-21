import { RoleGuard } from "@/lib/roleGuard";
import { getVisibleNavigation } from "@/lib/dashboardNavigation";
import { vendorNavigation } from "@/constants/dashboard";
import DashboardSidebar from "@/components/DashboardSidebar";
import type { ReactNode } from "react";
const VendorLayout = async ({ children }: { children: ReactNode }) => {
  const navigation = await getVisibleNavigation(vendorNavigation);
  return (
    <RoleGuard allowedRoles={["vendor"]}>
      {" "}
      <div className="flex min-h-screen">
        {" "}
        <DashboardSidebar navigation={navigation} />{" "}
        <main className="flex-1 p-6">{children}</main>{" "}
      </div>{" "}
    </RoleGuard>
  );
};
export default VendorLayout;
