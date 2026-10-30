import React from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: string;
  trendType?: "positive" | "negative" | "neutral";
  color?: "green" | "blue" | "purple" | "amber" | "rose";
}

const colorMap = {
  green: {
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-700",
    hoverBorder: "hover:border-emerald-200",
    accent: "bg-emerald-500",
  },
  blue: {
    iconBg: "bg-sky-50",
    iconText: "text-sky-700",
    hoverBorder: "hover:border-sky-200",
    accent: "bg-sky-500",
  },
  purple: {
    iconBg: "bg-purple-50",
    iconText: "text-purple-700",
    hoverBorder: "hover:border-purple-200",
    accent: "bg-purple-500",
  },
  amber: {
    iconBg: "bg-amber-50",
    iconText: "text-amber-700",
    hoverBorder: "hover:border-amber-200",
    accent: "bg-amber-500",
  },
  rose: {
    iconBg: "bg-rose-50",
    iconText: "text-rose-700",
    hoverBorder: "hover:border-rose-200",
    accent: "bg-rose-500",
  },
};

const trendStyles = {
  positive: "bg-emerald-50 text-emerald-700",
  negative: "bg-rose-50 text-rose-700",
  neutral: "bg-slate-100 text-slate-600",
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendType = "neutral",
  color = "green",
}) => {
  const styles = colorMap[color];

  const formattedValue =
    typeof value === "number" ? value.toLocaleString() : value;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-6 ${styles.hoverBorder}`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 ${styles.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium leading-5 text-slate-500">
            {title}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {formattedValue}
            </h3>

            {trend && (
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ${trendStyles[trendType]}`}
              >
                {trend}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.iconBg} ${styles.iconText} transition-transform duration-300 group-hover:scale-105`}
          >
            <Icon className="h-5 w-5" strokeWidth={1.9} />
          </div>
        )}
      </div>

      {description && (
        <p className="mt-3 truncate text-xs leading-5 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
};

export default StatsCard;