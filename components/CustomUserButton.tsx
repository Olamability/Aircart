"use client";

import { UserButton } from "@clerk/nextjs";
import { User, Package, MapPin, LayoutDashboard } from "lucide-react";

interface CustomUserButtonProps {
  dashboardHref?: string | null;
  dashboardLabel?: string | null;
}

const CustomUserButton: React.FC<CustomUserButtonProps> = ({
  dashboardHref,
  dashboardLabel,
}) => {
  return (
    <UserButton>
      <UserButton.MenuItems>
        {dashboardHref && (
          <UserButton.Link
            label={dashboardLabel || "Dashboard"}
            labelIcon={<LayoutDashboard size={15} />}
            href={dashboardHref}
          />
        )}
        <UserButton.Link
          label="My Account"
          labelIcon={<User size={15} />}
          href="/account"
        />
        <UserButton.Link
          label="My Orders"
          labelIcon={<Package size={15} />}
          href="/orders"
        />
        <UserButton.Link
          label="Delivery Addresses"
          labelIcon={<MapPin size={15} />}
          href="/account"
        />
        <UserButton.Action label="manageAccount" />
      </UserButton.MenuItems>
    </UserButton>
  );
};

export default CustomUserButton;
