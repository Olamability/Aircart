import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Store,
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Hash,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  RotateCcw,
  MessageSquare,
  History,
} from "lucide-react";
import { PermissionGuard } from "@/lib/permissionGuard";
import { permissions } from "@/lib/permissions";
import { getSuperAdminVendorApplicationDetail } from "@/sanity/queries/adminQueries";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { urlFor } from "@/sanity/lib/image";
import VendorApprovalActionPanel from "@/components/dashboard/VendorApprovalActionPanel";

interface HistoryEntry {
  action: string;
  reason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

interface VendorDetail {
  _id: string;
  businessName: string;
  slug?: { current: string };
  logo?: { asset?: { _ref: string } };
  description?: string;
  email: string;
  storeEmail?: string;
  phone?: string;
  storeCategory?: string;
  storeSubcategory?: string;
  storeAddress?: string;
  storeCity?: string;
  storeState?: string;
  storeLga?: string;
  registeredBusinessName?: string;
  businessType?: string;
  cacRegistrationNumber?: string;
  taxIdentificationNumber?: string;
  registeredBusinessAddress?: string;
  registeredBusinessCity?: string;
  registeredBusinessState?: string;
  registeredBusinessLga?: string;
  clerkUserId: string;
  status: string;
  rejectionReason?: string;
  reviewerNote?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  approvalHistory?: HistoryEntry[];
  createdAt?: string;
  updatedAt?: string;
}

const fmt = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const businessTypeLabels: Record<string, string> = {
  sole_proprietorship: "Sole Proprietorship",
  partnership: "Partnership",
  limited_liability_company: "Limited Liability Company",
  other: "Other",
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-4 py-2.5 border-b border-slate-100 last:border-0">
      <dt className="w-48 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="text-sm text-slate-800 break-words">
        {value || <span className="italic text-slate-400">Not provided</span>}
      </dd>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3">
        <Icon className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>
      <dl className="px-5 py-1">{children}</dl>
    </div>
  );
}

function historyActionLabel(action: string) {
  const map: Record<string, { label: string; color: string }> = {
    approved: { label: "Approved", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    rejected: { label: "Rejected", color: "text-rose-700 bg-rose-50 border-rose-200" },
    suspended: { label: "Suspended", color: "text-orange-700 bg-orange-50 border-orange-200" },
    reinstated: { label: "Reinstated", color: "text-sky-700 bg-sky-50 border-sky-200" },
    reopened: { label: "Reopened", color: "text-violet-700 bg-violet-50 border-violet-200" },
    changes_requested: { label: "Changes Requested", color: "text-amber-700 bg-amber-50 border-amber-200" },
  };
  return map[action] ?? { label: action, color: "text-slate-600 bg-slate-50 border-slate-200" };
}

const SuperAdminVendorApplicationPage = async ({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) => {
  const { vendorId } = await params;
  const data = await getSuperAdminVendorApplicationDetail(vendorId);

  if (!data?.vendor) notFound();

  const vendor: VendorDetail = data.vendor;
  const productCount: number = data.productCount ?? 0;
  const orderCount: number = data.orderCount ?? 0;

  const logoUrl = vendor.logo?.asset
    ? urlFor(vendor.logo).width(80).height(80).url()
    : null;

  const history: HistoryEntry[] = Array.isArray(vendor.approvalHistory)
    ? [...vendor.approvalHistory].reverse()
    : [];

  return (
    <PermissionGuard permission={permissions.approvals_view}>
      <div className="space-y-6 pb-12">
        {/* Back nav */}
        <Link
          href="/super-admin/approvals"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Link>

        {/* Header */}
        <DashboardHeader
          title={vendor.businessName}
          description={`Vendor application · submitted ${fmt(vendor.createdAt)}`}
          badge={<StatusBadge status={vendor.status} />}
        />

        {/* Store snapshot + action panel */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Left: store snapshot */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={vendor.businessName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <Store className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{vendor.businessName}</p>
                <p className="text-xs text-slate-500 mt-0.5">{vendor.email}</p>
                {vendor.storeCategory && (
                  <p className="text-xs text-slate-400 mt-0.5">{vendor.storeCategory}</p>
                )}
              </div>
            </div>

            {vendor.description && (
              <p className="text-sm text-slate-600 leading-relaxed">{vendor.description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              {[
                { label: "Products", value: productCount },
                { label: "Orders", value: orderCount },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-center"
                >
                  <p className="text-xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Reviewer note / rejection reason banners */}
            {vendor.status === "pending" && vendor.reviewerNote && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-1">
                <p className="text-xs font-semibold text-amber-800">Changes requested:</p>
                <p className="text-xs text-amber-700">{vendor.reviewerNote}</p>
              </div>
            )}
            {(vendor.status === "rejected" || vendor.status === "suspended") &&
              vendor.rejectionReason && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 space-y-1">
                  <p className="text-xs font-semibold text-rose-800">
                    {vendor.status === "rejected" ? "Rejection reason:" : "Suspension reason:"}
                  </p>
                  <p className="text-xs text-rose-700">{vendor.rejectionReason}</p>
                </div>
              )}
          </div>

          {/* Right: action panel (2/3 width on large) */}
          <div className="lg:col-span-2">
            <VendorApprovalActionPanel
              vendorId={vendor._id}
              vendorName={vendor.businessName}
              currentStatus={vendor.status}
            />
          </div>
        </div>

        {/* Business information sections */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Section title="Store Information" icon={Store}>
            <InfoRow label="Store Name" value={vendor.businessName} />
            <InfoRow label="Account Email" value={vendor.email} />
            <InfoRow label="Store Email" value={vendor.storeEmail} />
            <InfoRow label="Phone Number" value={vendor.phone} />
            <InfoRow label="Category" value={vendor.storeCategory} />
            <InfoRow label="Subcategory" value={vendor.storeSubcategory} />
          </Section>

          <Section title="Store Address" icon={MapPin}>
            <InfoRow label="Address" value={vendor.storeAddress} />
            <InfoRow label="City" value={vendor.storeCity} />
            <InfoRow label="State" value={vendor.storeState} />
            <InfoRow label="LGA" value={vendor.storeLga} />
          </Section>

          <Section title="Registered Business Details" icon={Building2}>
            <InfoRow
              label="Registered Name"
              value={vendor.registeredBusinessName}
            />
            <InfoRow
              label="Business Type"
              value={
                vendor.businessType
                  ? businessTypeLabels[vendor.businessType] ?? vendor.businessType
                  : undefined
              }
            />
            <InfoRow
              label="CAC Number"
              value={vendor.cacRegistrationNumber}
            />
            <InfoRow
              label="TIN"
              value={vendor.taxIdentificationNumber}
            />
          </Section>

          <Section title="Registered Business Address" icon={FileText}>
            <InfoRow
              label="Address"
              value={vendor.registeredBusinessAddress}
            />
            <InfoRow
              label="City"
              value={vendor.registeredBusinessCity}
            />
            <InfoRow
              label="State"
              value={vendor.registeredBusinessState}
            />
            <InfoRow
              label="LGA"
              value={vendor.registeredBusinessLga}
            />
          </Section>
        </div>

        {/* Administrative metadata */}
        <Section title="Administrative Details" icon={Hash}>
          <InfoRow label="Vendor ID" value={vendor._id} />
          <InfoRow label="Clerk User ID" value={vendor.clerkUserId} />
          <InfoRow label="Submitted" value={fmt(vendor.createdAt)} />
          <InfoRow label="Last Updated" value={fmt(vendor.updatedAt)} />
          <InfoRow label="Last Reviewed At" value={fmt(vendor.reviewedAt)} />
          <InfoRow label="Last Reviewed By" value={vendor.reviewedBy} />
        </Section>

        {/* Approval history timeline */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3">
            <History className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700">Approval History</h3>
          </div>
          <div className="p-5">
            {history.length === 0 ? (
              <p className="text-sm text-slate-400 italic">
                No approval actions have been taken on this application yet.
              </p>
            ) : (
              <ol className="relative border-l border-slate-200 space-y-6 pl-6">
                {history.map((entry, i) => {
                  const { label, color } = historyActionLabel(entry.action);
                  return (
                    <li key={i} className="relative">
                      <span className="absolute -left-[25px] top-1 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-slate-200 ring-1 ring-slate-200" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${color}`}
                          >
                            {label}
                          </span>
                          <span className="text-xs text-slate-400">
                            {fmt(entry.reviewedAt)}
                          </span>
                        </div>
                        {entry.reviewedBy && (
                          <p className="text-xs text-slate-500">
                            By: <span className="font-medium">{entry.reviewedBy}</span>
                          </p>
                        )}
                        {entry.reason && (
                          <p className="text-xs text-slate-600 bg-slate-50 rounded px-2 py-1 border border-slate-100">
                            {entry.reason}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
};

export default SuperAdminVendorApplicationPage;

