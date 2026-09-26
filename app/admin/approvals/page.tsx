import React from "react";
import { getAdminApprovals } from "@/sanity/queries/adminQueries";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ApprovalsHub from "@/components/dashboard/ApprovalsHub";
import { PermissionGuard } from "@/lib/permissionGuard";
import { permissions } from "@/lib/permissions";

const AdminApprovalsPage = async () => {
  const { pendingVendors, suspendedVendors } = await getAdminApprovals();

  return (
    <PermissionGuard permission={permissions.approvals_view}>
      <div className="space-y-6 pb-12">
        <DashboardHeader
          title="Administrative Approvals Queue"
          description="Verify vendor credentials, audit catalog product submissions, and clear merchant compliance documents."
        />

        <ApprovalsHub
          pendingVendors={pendingVendors}
          suspendedVendors={suspendedVendors}
        />
      </div>
    </PermissionGuard>
  );
};

export default AdminApprovalsPage;
