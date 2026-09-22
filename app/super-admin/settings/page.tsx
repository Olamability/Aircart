import React from "react";
import { Sliders, Save, ShieldCheck, AlertTriangle } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

const SuperAdminSettingsPage = () => {
  return (
    <div className="space-y-8 pb-12">
      <DashboardHeader
        title="Global Platform Settings"
        description="Configure runtime marketplace policies, security flags, and registration accessibility."
      />

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 max-w-3xl">
        <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Runtime Governance Controls
        </h3>

        <div className="space-y-6 text-sm divide-y divide-slate-100">
          <div className="flex items-center justify-between pt-4 first:pt-0">
            <div>
              <span className="font-semibold text-slate-900 block">
                Platform Maintenance Mode
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Renders a temporary maintenance banner across the public storefront.
              </p>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-slate-300 text-shop-dark-green focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              <span className="font-semibold text-slate-900 block">
                Merchant Auto-Approval
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically approve new vendor registrations without manual review.
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked={false}
              className="h-5 w-5 rounded border-slate-300 text-shop-dark-green focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              <span className="font-semibold text-slate-900 block">
                Customer User Registrations
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Allow new buyer accounts to register via Clerk authentication.
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked={true}
              className="h-5 w-5 rounded border-slate-300 text-shop-dark-green focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              <span className="font-semibold text-slate-900 block">
                Default Currency Code
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Authoritative ISO currency symbol for marketplace catalog prices.
              </p>
            </div>
            <select
              defaultValue="NGN"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              <option value="NGN">NGN (₦)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 flex justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-shop-dark-green px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-shop-light-green transition"
          >
            <Save className="h-4 w-4" />
            Save Platform Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSettingsPage;
