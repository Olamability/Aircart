
import { RoleGuard } from "@/lib/roleGuard";
import { getVisibleNavigation } from "@/lib/dashboardNavigation";
import { getCurrentVendor } from "@/lib/vendor";
import { vendorNavigation } from "@/constants/dashboard";
import DashboardLayoutShell from "@/components/dashboard/DashboardLayoutShell";
import type { ReactNode } from "react";

const VendorLayout = async ({ children }: { children: ReactNode }) => {
  const [navigation, vendor] = await Promise.all([
    getVisibleNavigation(vendorNavigation),
    getCurrentVendor(),
  ]);

  const vendorStoreUrl =
    vendor?.status === "approved" && vendor?.slug?.current
      ? `/vendor/${vendor.slug.current}`
      : null;

  return (
    <RoleGuard allowedRoles={["vendor"]}>
      <DashboardLayoutShell
        navigation={navigation}
        roleTitle="Merchant"
        dashboardRoot="/vendor"
        badgeLabel="Vendor"
        badgeColor="bg-sky-50 text-sky-700 border-sky-200"
        vendorStoreUrl={vendorStoreUrl}
      >
        {children}
      </DashboardLayoutShell>
    </RoleGuard>
  );
};

export default VendorLayout;
