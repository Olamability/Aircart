import React from "react";

export default function SuperAdminLoading() {
  return (
    <div className="space-y-8 pb-16 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-slate-200 rounded-lg" />
          <div className="h-4 w-96 bg-slate-100 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-slate-200 rounded-xl" />
          <div className="h-9 w-28 bg-slate-200 rounded-xl" />
        </div>
      </div>

      {/* Identity Banner Skeleton */}
      <div className="h-32 w-full rounded-2xl bg-slate-200" />

      {/* Financial KPIs Skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-8 w-32 bg-slate-300 rounded" />
              <div className="h-3 w-28 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 2x2 Section Grids Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="h-5 w-36 bg-slate-200 rounded" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="h-64 rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="h-5 w-36 bg-slate-200 rounded" />
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Catalog & Orders Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="h-5 w-36 bg-slate-200 rounded" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="h-64 rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="h-5 w-36 bg-slate-200 rounded" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Activity Table Skeleton */}
      <div className="h-80 rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <div className="h-5 w-48 bg-slate-200 rounded" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-slate-50 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

