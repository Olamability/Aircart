import React from "react";
import Link from "next/link";
import { UserCheck, LucideIcon, Store } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";

interface VendorMissingProfileStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
}

export const VendorMissingProfileState: React.FC<VendorMissingProfileStateProps> = ({
  icon = Store,
  title = "Merchant Profile Required",
  description = "Your merchant profile has not been fully configured yet. Set up your business profile to begin managing your store.",
}) => {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      action={
        <Link
          href="/vendor/profile"
          className="inline-flex items-center gap-2 rounded-lg bg-shop-dark-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-shop-light-green transition"
        >
          <UserCheck className="h-4 w-4" />
          Complete Store Profile
        </Link>
      }
    />
  );
};

export default VendorMissingProfileState;
