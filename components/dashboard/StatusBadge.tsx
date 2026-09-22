import React from "react";

interface StatusBadgeProps {
  status?: string | null;
  className?: string;
}

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  // Common states
  approved: { bg: "bg-emerald-50 text-emerald-700", text: "text-emerald-700", border: "border-emerald-200" },
  active: { bg: "bg-emerald-50 text-emerald-700", text: "text-emerald-700", border: "border-emerald-200" },
  available: { bg: "bg-emerald-50 text-emerald-700", text: "text-emerald-700", border: "border-emerald-200" },
  paid: { bg: "bg-emerald-50 text-emerald-700", text: "text-emerald-700", border: "border-emerald-200" },
  delivered: { bg: "bg-emerald-50 text-emerald-700", text: "text-emerald-700", border: "border-emerald-200" },
  completed: { bg: "bg-emerald-50 text-emerald-700", text: "text-emerald-700", border: "border-emerald-200" },

  pending: { bg: "bg-amber-50 text-amber-700", text: "text-amber-700", border: "border-amber-200" },
  processing: { bg: "bg-sky-50 text-sky-700", text: "text-sky-700", border: "border-sky-200" },
  shipped: { bg: "bg-indigo-50 text-indigo-700", text: "text-indigo-700", border: "border-indigo-200" },
  out_for_delivery: { bg: "bg-purple-50 text-purple-700", text: "text-purple-700", border: "border-purple-200" },

  suspended: { bg: "bg-rose-50 text-rose-700", text: "text-rose-700", border: "border-rose-200" },
  cancelled: { bg: "bg-rose-50 text-rose-700", text: "text-rose-700", border: "border-rose-200" },
  failed: { bg: "bg-rose-50 text-rose-700", text: "text-rose-700", border: "border-rose-200" },
  refunded: { bg: "bg-orange-50 text-orange-700", text: "text-orange-700", border: "border-orange-200" },

  new: { bg: "bg-teal-50 text-teal-700", text: "text-teal-700", border: "border-teal-200" },
  hot: { bg: "bg-red-50 text-red-700", text: "text-red-700", border: "border-red-200" },
  sale: { bg: "bg-amber-50 text-amber-700", text: "text-amber-700", border: "border-amber-200" },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  if (!status) return null;

  const normalized = status.toLowerCase().replace(/\s+/g, "_");
  const style = statusStyles[normalized] ?? {
    bg: "bg-slate-50 text-slate-700",
    text: "text-slate-700",
    border: "border-slate-200",
  };

  const formattedLabel = status
    .split(/[_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg} ${style.border} ${className}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75" />
      {formattedLabel}
    </span>
  );
};

export default StatusBadge;
