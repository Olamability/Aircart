"use client";

import React from "react";
import { Download } from "lucide-react";

interface ExportTransactionsButtonProps {
  transactions: Array<{
    _id: string;
    orderNumber?: string;
    customerName?: string;
    customerEmail?: string;
    totalPrice: number;
    paymentStatus: string;
    provider?: string;
    paymentReference?: string;
    createdAt?: string;
  }>;
}

export const ExportTransactionsButton: React.FC<ExportTransactionsButtonProps> = ({
  transactions = [],
}) => {
  const handleExport = () => {
    if (!transactions.length) {
      alert("No transaction records available to export.");
      return;
    }

    const headers = [
      "Transaction ID",
      "Order Number",
      "Gateway Provider",
      "Customer Name",
      "Customer Email",
      "Total Amount (NGN)",
      "Marketplace Commission 5% (NGN)",
      "Vendor Net (NGN)",
      "Payment Status",
      "Payment Reference",
      "Date",
    ];

    const rows = transactions.map((t) => {
      const gross = t.totalPrice || 0;
      const commission = gross * 0.05;
      const net = gross * 0.95;
      const ref = t.paymentReference || t._id;

      return [
        `"${t._id}"`,
        `"${t.orderNumber || ""}"`,
        `"${t.provider || "stripe"}"`,
        `"${(t.customerName || "Customer").replace(/"/g, '""')}"`,
        `"${(t.customerEmail || "").replace(/"/g, '""')}"`,
        gross.toFixed(2),
        commission.toFixed(2),
        net.toFixed(2),
        `"${t.paymentStatus || "pending"}"`,
        `"${ref.replace(/"/g, '""')}"`,
        `"${t.createdAt ? new Date(t.createdAt).toISOString() : ""}"`,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `marketplace-financial-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition"
      title="Download CSV report of current transactions"
    >
      <Download className="h-4 w-4 text-slate-500" />
      Export CSV
    </button>
  );
};

