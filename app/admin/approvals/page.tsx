import React from "react";
import { getAdminApprovals } from "@/sanity/queries/adminQueries";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ApprovalsHub from "@/components/dashboard/ApprovalsHub";

const AdminApprovalsPage = async () => {
  const { pendingVendors, suspendedVendors } = await getAdminApprovals();

  return (
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
  );
};

export default AdminApprovalsPage;
