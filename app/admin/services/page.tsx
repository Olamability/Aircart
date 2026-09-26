import React from "react";
import { Sparkles, Briefcase, Wrench, Shield, PlusCircle } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import { PermissionGuard } from "@/lib/permissionGuard";
import { permissions } from "@/lib/permissions";

const AdminServicesPage = () => {
  const serviceCategories = [
    {
      title: "Home & Cleaning Services",
      desc: "Residential cleaning, deep sanitation, carpet cleaning, laundry dispatch",
      activeProviders: 0,
      icon: Sparkles,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "Technical & Appliances Repairs",
      desc: "HVAC maintenance, electronics fixing, refrigerator servicing, electrician calls",
      activeProviders: 0,
      icon: Wrench,
      color: "text-sky-600 bg-sky-50",
    },
    {
      title: "Professional & Business Services",
      desc: "Consulting, legal paperwork, courier dispatch, verified vendor document auditing",
      activeProviders: 0,
      icon: Briefcase,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <PermissionGuard permission={permissions.services_view}>
      <div className="space-y-8 pb-12">
      <DashboardHeader
        title="Services Marketplace Management"
        description="Configure on-demand local services, certified artisan providers, booking slots, and service categories."
      >
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 rounded-lg bg-shop-dark-green/50 px-4 py-2 text-sm font-semibold text-white cursor-not-allowed"
        >
          <PlusCircle className="h-4 w-4" />
          Add Service Listing
        </button>
      </DashboardHeader>

      {/* Service Infrastructure Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {serviceCategories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className={`inline-flex p-2.5 rounded-lg ${cat.color} mb-3`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-slate-900 text-sm">{cat.title}</h4>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{cat.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Active Providers: {cat.activeProviders}</span>
                <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Architecture Ready
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Service Listings Empty State */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <EmptyState
          icon={Sparkles}
          title="Services Module Ready"
          description="Service provider applications will appear here as merchants submit their artisan and service portfolios for administrative verification."
        />
      </div>
    </div>
    </PermissionGuard>
  );
};

export default AdminServicesPage;
