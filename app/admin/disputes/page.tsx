import React from "react";
import { MessageSquareWarning, RefreshCcw, Truck, AlertCircle, CheckCircle2 } from "lucide-react";
import { getAdminDisputes } from "@/sanity/queries/adminQueries";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import FilterBar from "@/components/dashboard/FilterBar";
import { DisputesManager } from "@/components/dashboard/DisputesManager";
import { PermissionGuard } from "@/lib/permissionGuard";
import { permissions } from "@/lib/permissions";

interface AdminDisputesPageProps {
  searchParams: Promise<{
    query?: string;
    status?: string;
    reason?: string;
  }>;
}

const AdminDisputesPage = async ({ searchParams }: AdminDisputesPageProps) => {
  const sp = await searchParams;
  const { disputes, counts } = await getAdminDisputes({
    query: sp.query,
    status: sp.status,
    reason: sp.reason,
  });

  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "All Statuses", value: "all" },
        { label: "Open / Pending", value: "open" },
        { label: "Under Investigation", value: "investigating" },
        { label: "Escalated", value: "escalated" },
        { label: "Resolved", value: "resolved" },
      ],
    },
    {
      key: "reason",
      label: "Dispute Type",
      options: [
        { label: "All Types", value: "all" },
        { label: "Non-Delivery", value: "non_delivery" },
        { label: "Damaged Item", value: "damaged_item" },
        { label: "Wrong Item", value: "wrong_item" },
        { label: "Refund Request", value: "refund_request" },
      ],
    },
  ];

  return (
    <PermissionGuard permission={permissions.disputes_view}>
      <div className="space-y-8 pb-12">
        <DashboardHeader
          title="Disputes & Claims Arbitration Center"
          description="Mediate buyer-seller claims, investigate delivery disputes, manage return tickets, and enforce marketplace policies."
        />

        {/* Live Operational Metrics Derived from Sanity Backend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Open Claims"
            value={counts.open}
            icon={AlertCircle}
            color="amber"
            description="Awaiting arbitration"
          />
          <StatsCard
            title="Transit & Delivery"
            value={counts.delivery}
            icon={Truck}
            color="blue"
            description="Carrier & shipping disputes"
          />
          <StatsCard
            title="Refund Requests"
            value={counts.refunds}
            icon={RefreshCcw}
            color="purple"
            description="Return & chargeback queue"
          />
          <StatsCard
            title="Resolved Claims"
            value={counts.resolved}
            icon={CheckCircle2}
            color="green"
            description="Platform resolutions concluded"
          />
        </div>

        <FilterBar searchPlaceholder="Search disputes by subject, claimant name, or email..." filters={filters} />

        <DisputesManager disputes={disputes} />
      </div>
    </PermissionGuard>
  );
};

export default AdminDisputesPage;
