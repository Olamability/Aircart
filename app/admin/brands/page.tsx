import React from "react";
import { getAdminBrands } from "@/sanity/queries/adminQueries";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import BrandManager from "@/components/dashboard/BrandManager";

const AdminBrandsPage = async () => {
  const brands = await getAdminBrands();

  return (
    <div className="space-y-6 pb-12">
      <DashboardHeader
        title="Brands Management"
        description="Oversee manufacturer brands, trademark badges, and marketplace product associations."
      />

      <BrandManager initialBrands={brands} />
    </div>
  );
};

export default AdminBrandsPage;
