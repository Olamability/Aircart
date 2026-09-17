"use client";

import { UserButton } from "@clerk/nextjs";
import { User, Package, MapPin } from "lucide-react";

const CustomUserButton = () => {
  return (
    <UserButton>
      <UserButton.MenuItems>
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
