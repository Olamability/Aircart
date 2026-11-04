"use client";

import React, { useEffect } from "react";
import { AlertOctagon, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

interface SuperAdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SuperAdminError({ error, reset }: SuperAdminErrorProps) {
  useEffect(() => {
    console.error("Super Admin Dashboard Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 mb-4">
        <AlertOctagon className="h-8 w-8" />
      </div>

      <h2 className="text-xl font-bold text-slate-900">
        Super Admin Console Error
      </h2>

      <p className="mt-2 text-sm text-slate-600 max-w-md">
        An error occurred while aggregating real-time marketplace metrics. The underlying backend services may be experiencing high latency or connectivity issues.
      </p>

      {error.message && (
        <code className="mt-4 rounded-lg bg-slate-100 p-3 text-xs font-mono text-slate-700 max-w-xl text-left overflow-x-auto block">
          {error.message}
        </code>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-shop-dark-green px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-shop-light-green transition"
        >
          <RefreshCcw className="h-4 w-4" />
          Retry Connection
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
        >
          <Home className="h-4 w-4" />
          Platform Home
        </Link>
      </div>
    </div>
  );
}

