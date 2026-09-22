import React from "react";
import { Webhook, CheckCircle2, RefreshCw, Radio, Zap } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";

const SuperAdminWebhooksPage = () => {
  const webhooks = [
    {
      name: "Stripe Checkout & Payment Intent Webhook",
      url: "/api/webhooks/stripe",
      events: ["checkout.session.completed", "payment_intent.succeeded", "charge.refunded"],
      status: "listening",
      latency: "142ms",
    },
    {
      name: "Paystack Transaction Verify Webhook",
      url: "/api/webhooks/paystack",
      events: ["charge.success", "transfer.success", "transfer.failed"],
      status: "listening",
      latency: "185ms",
    },
    {
      name: "Sanity Live Content Synchronization",
      url: "/api/webhooks/sanity",
      events: ["document.create", "document.update", "document.delete"],
      status: "listening",
      latency: "98ms",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <DashboardHeader
        title="Global Webhooks Infrastructure"
        description="Monitor automated server-side webhook endpoints for Stripe, Paystack, and Sanity CMS live mutations."
      />

      {/* Webhook KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Active Listeners"
          value={3}
          icon={Radio}
          color="green"
          description="Operational webhook routes"
        />
        <StatsCard
          title="Average Latency"
          value="141ms"
          icon={Zap}
          color="blue"
          description="Roundtrip acknowledgment"
        />
        <StatsCard
          title="Health Status"
          value="100% Healthy"
          icon={CheckCircle2}
          color="purple"
          description="Zero delivery failures in 24h"
        />
      </div>

      {/* Webhook Endpoints List */}
      <div className="space-y-4 max-w-4xl">
        {webhooks.map((wh, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <Webhook className="h-4 w-4 text-emerald-600" />
                <h4 className="font-semibold text-slate-900 text-sm">{wh.name}</h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  {wh.status}
                </span>
              </div>
              <code className="text-xs font-mono text-slate-500 block">{wh.url}</code>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {wh.events.map((ev) => (
                  <span
                    key={ev}
                    className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                  >
                    {ev}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 md:pt-0">
              <span className="text-xs text-slate-400 font-mono">Ping: {wh.latency}</span>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                <RefreshCw className="h-3 w-3" /> Test Ping
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminWebhooksPage;
