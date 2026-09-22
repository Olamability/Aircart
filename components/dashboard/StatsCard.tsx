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
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "hover:border-emerald-300",
  },
  blue: {
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "hover:border-sky-300",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "hover:border-purple-300",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "hover:border-amber-300",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "hover:border-rose-300",
  },
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
  const styles = colorMap[color] || colorMap.green;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 ${styles.border}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {Icon && (
          <div className={`rounded-lg p-2.5 ${styles.bg} ${styles.text}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {trend && (
          <span
            className={`text-xs font-semibold ${
              trendType === "positive"
                ? "text-emerald-600"
                : trendType === "negative"
                ? "text-rose-600"
                : "text-slate-500"
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-1 text-xs text-slate-500 line-clamp-1">{description}</p>
      )}
    </div>
  );
};

export default StatsCard;
