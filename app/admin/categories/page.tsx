import React from "react";
import { getAdminCategories } from "@/sanity/queries/adminQueries";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CategoryManager from "@/components/dashboard/CategoryManager";

const AdminCategoriesPage = async () => {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-6 pb-12">
      <DashboardHeader
        title="Category Taxonomy"
        description="Organize marketplace product groupings, navigation trees, and category relationships."
      />

      <CategoryManager initialCategories={categories} />
    </div>
  );
};

export default AdminCategoriesPage;
