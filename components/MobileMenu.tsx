"use client";

import { AlignLeft } from "lucide-react";
import React, { useState } from "react";
import SideMenu from "./SideMenu";

interface MobileMenuProps {
  dashboardHref?: string | null;
  dashboardLabel?: string | null;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  dashboardHref,
  dashboardLabel,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Open Mobile Menu"
      >
        <AlignLeft className="hover:text-darkColor hoverEffect md:hidden hover:cursor-pointer" />
      </button>
      <div className="md:hidden">
        <SideMenu
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          dashboardHref={dashboardHref}
          dashboardLabel={dashboardLabel}
        />
      </div>
    </>
  );
};

export default MobileMenu;
