"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Store, ShieldCheck, FileText, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import VendorStatusActions from "@/components/dashboard/VendorStatusActions";
import EmptyState from "@/components/dashboard/EmptyState";

interface ApprovalsHubProps {
  pendingVendors: any[];
  suspendedVendors: any[];
}

const ApprovalsHub: React.FC<ApprovalsHubProps> = ({
  pendingVendors,
  suspendedVendors,
}) => {
  const [activeTab, setActiveTab] = useState<"vendors" | "products" | "services" | "documents">("vendors");

  const tabs = [
    { id: "vendors", label: "Vendor Approvals", count: pendingVendors.length, icon: Store },
    { id: "products", label: "Product Reviews", count: 0, icon: ShieldCheck },
    { id: "services", label: "Service Applications", count: 0, icon: Sparkles },
    { id: "documents", label: "Document Reviews", count: 0, icon: FileText },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-5 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                isActive
                  ? "border-emerald-600 text-shop-dark-green font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="ml-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.2">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "vendors" && (
        <div className="space-y-4">
          {pendingVendors.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="All caught up!"
              description="There are currently no vendor onboarding applications pending administrative clearance."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingVendors.map((vendor) => {
                const logoUrl =
                  vendor.logo && vendor.logo.asset
                    ? urlFor(vendor.logo).width(64).height(64).url()
                    : null;

                return (
                  <div
                    key={vendor._id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shrink-0">
                        {logoUrl ? (
                          <Image
                            src={logoUrl}
                            alt={vendor.businessName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <Store className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900 text-sm truncate">
                            {vendor.businessName}
                          </h4>
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                            <Clock className="h-2.5 w-2.5" /> Pending
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{vendor.email}</p>
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                          {vendor.description || "No business description provided."}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Applied:{" "}
                        {vendor.createdAt
                          ? new Date(vendor.createdAt).toLocaleDateString()
                          : "Recently"}
                      </span>
                      <VendorStatusActions
                        vendorId={vendor._id}
                        vendorName={vendor.businessName}
                        currentStatus="pending"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "products" && (
        <EmptyState
          icon={ShieldCheck}
          title="Product Approvals Clear"
          description="All active vendor products conform to platform listing policies. Flagged or pending products will queue here."
        />
      )}

      {activeTab === "services" && (
        <EmptyState
          icon={Sparkles}
          title="No Service Applications"
          description="Service provider applications from local artisans will queue here for credentials verification."
        />
      )}

      {activeTab === "documents" && (
        <EmptyState
          icon={FileText}
          title="Document Review Queue Empty"
          description="Tax registrations, business permits, and identification documents will appear here for compliance review."
        />
      )}
    </div>
  );
};

export default ApprovalsHub;
