import { RoleGuard } from "@/lib/roleGuard";
import { getVisibleNavigation } from "@/lib/dashboardNavigation";
import { vendorNavigation } from "@/constants/dashboard";
import DashboardLayoutShell from "@/components/dashboard/DashboardLayoutShell";
import type { ReactNode } from "react";

const VendorLayout = async ({ children }: { children: ReactNode }) => {
  const navigation = await getVisibleNavigation(vendorNavigation);

  return (
    <RoleGuard allowedRoles={["vendor"]}>
      <DashboardLayoutShell
        navigation={navigation}
        roleTitle="Merchant"
        dashboardRoot="/vendor"
        badgeLabel="Vendor"
        badgeColor="bg-sky-50 text-sky-700 border-sky-200"
      >
        {children}
      </DashboardLayoutShell>
    </RoleGuard>
  );
};

export default VendorLayout;
