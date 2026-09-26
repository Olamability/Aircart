import React from "react";
import { MessageSquareWarning, RefreshCcw, Truck, AlertCircle, CheckCircle2 } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { PermissionGuard } from "@/lib/permissionGuard";
import { permissions } from "@/lib/permissions";

const AdminDisputesPage = () => {
  return (
    <PermissionGuard permission={permissions.disputes_view}>
      <div className="space-y-8 pb-12">
      <DashboardHeader
        title="Disputes & Claims Center"
        description="Mediate buyer-seller claims, oversee refund chargebacks, and resolve order delivery issues."
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatsCard
          title="Open Claims"
          value={0}
          icon={AlertCircle}
          color="amber"
          description="Awaiting mediation"
        />
        <StatsCard
          title="Delivery Claims"
          value={0}
          icon={Truck}
          color="blue"
          description="Transit or non-delivery"
        />
        <StatsCard
          title="Refund Requests"
          value={0}
          icon={RefreshCcw}
          color="purple"
          description="Return & refund queue"
        />
        <StatsCard
          title="Resolved Claims"
          value={0}
          icon={CheckCircle2}
          color="green"
          description="Resolved this month"
        />
      </div>

      {/* Disputes Table Container / Empty State */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <EmptyState
          icon={MessageSquareWarning}
          title="No open disputes"
          description="Customer claims regarding product quality, missing parcels, or merchant refund requests will queue here for platform arbitration."
        />
      </div>
    </div>
    </PermissionGuard>
  );
};

export default AdminDisputesPage;
