"use client";

import React from "react";
import { Download } from "lucide-react";
import type { SuperAdminVendorLedgerItem } from "@/sanity/queries/adminQueries";

interface ExportLedgerButtonProps {
  vendors: SuperAdminVendorLedgerItem[];
}

export const ExportLedgerButton: React.FC<ExportLedgerButtonProps> = ({ vendors = [] }) => {
  const handleExport = () => {
    if (!vendors.length) {
      alert("No ledger data to export.");
      return;
    }

    const headers = [
      "Vendor ID",
      "Business Name",
      "Email",
      "Account Status",
      "Cleared Orders",
      "Units Sold",
      "Gross Sales (NGN)",
      "Marketplace Commission 5% (NGN)",
      "Net Balance Payable (NGN)",
    ];

    const rows = vendors.map((v) => [
      `"${v.vendorId}"`,
      `"${v.businessName.replace(/"/g, '""')}"`,
      `"${v.email.replace(/"/g, '""')}"`,
      `"${v.status}"`,
      v.clearedOrdersCount,
      v.totalUnitsSold,
      v.grossSales.toFixed(2),
      v.platformCommission.toFixed(2),
      v.netVendorBalance.toFixed(2),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vendor-ledger-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
      title="Export Vendor Ledger CSV"
    >
      <Download className="h-4 w-4 text-slate-500" />
      Export Ledger CSV
    </button>
  );
};

