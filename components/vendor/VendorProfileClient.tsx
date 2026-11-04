
"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  Edit3,
  ExternalLink,
  Globe,
  ImagePlus,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Save,
  ShieldCheck,
  ShoppingBag,
  Store,
  Upload,
  UserRound,
  X,
} from "lucide-react";

import { uploadVendorLogo } from "@/actions/uploadVendorLogo";
import { updateVendorProfile } from "@/actions/updateVendorProfile";
import { urlFor } from "@/sanity/lib/image";

interface VendorProfile {
  _id: string;
  businessName?: string;
  slug?: { current?: string };
  logo?: { asset?: { _ref: string; _type: "reference" } };
  description?: string;
  email?: string;
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
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface VendorStats {
  totalProducts: number;
  activeProducts: number;
  lowStockCount: number;
  totalOrders: number;
}

interface VendorProfileClientProps {
  vendor: VendorProfile;
  stats: VendorStats;
}

type ProfileFields = {
  businessName: string;
  description: string;
  storeEmail: string;
  phone: string;
  storeCategory: string;
  storeSubcategory: string;
  storeAddress: string;
  storeCity: string;
  storeState: string;
  storeLga: string;
  registeredBusinessName: string;
  businessType: string;
  cacRegistrationNumber: string;
  taxIdentificationNumber: string;
  registeredBusinessAddress: string;
  registeredBusinessCity: string;
  registeredBusinessState: string;
  registeredBusinessLga: string;
};

const getInitialFields = (vendor: VendorProfile): ProfileFields => ({
  businessName: vendor.businessName ?? "",
  description: vendor.description ?? "",
  storeEmail: vendor.storeEmail ?? "",
  phone: vendor.phone ?? "",
  storeCategory: vendor.storeCategory ?? "",
  storeSubcategory: vendor.storeSubcategory ?? "",
  storeAddress: vendor.storeAddress ?? "",
  storeCity: vendor.storeCity ?? "",
  storeState: vendor.storeState ?? "",
  storeLga: vendor.storeLga ?? "",
  registeredBusinessName: vendor.registeredBusinessName ?? "",
  businessType: vendor.businessType ?? "",
  cacRegistrationNumber: vendor.cacRegistrationNumber ?? "",
  taxIdentificationNumber: vendor.taxIdentificationNumber ?? "",
  registeredBusinessAddress: vendor.registeredBusinessAddress ?? "",
  registeredBusinessCity: vendor.registeredBusinessCity ?? "",
  registeredBusinessState: vendor.registeredBusinessState ?? "",
  registeredBusinessLga: vendor.registeredBusinessLga ?? "",
});

const inputClass =
  "w-full rounded-xl border border-[#E1E6E1] bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#063C28] focus:ring-2 focus:ring-[#063C28]/10 disabled:bg-gray-50";

const labelClass = "mb-2 block text-sm font-semibold text-gray-700";

const formatDate = (date?: string) => {
  if (!date) return "Not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Not available";

  return parsed.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatStatus = (status?: string) => {
  if (!status) return "Unknown";

  return status.charAt(0).toUpperCase() + status.slice(1);
};

const Detail = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string;
  icon?: React.ElementType;
}) => (
  <div className="flex min-w-0 gap-3">
    {Icon && (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E2F5EB] text-[#063C28]">
        <Icon className="h-4 w-4" />
      </div>
    )}

    <div className="min-w-0 pt-0.5">
      <p className="text-xs text-[#737B73]">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-[#25352D]">
        {value?.trim() || "Not provided"}
      </p>
    </div>
  </div>
);

const SectionHeading = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="mb-6 flex items-center gap-3">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#DDF3E8] text-[#063C28]">
      <Icon className="h-6 w-6" />
    </div>

    <div>
      <h2 className="text-base font-bold text-[#142E22] sm:text-lg">
        {title}
      </h2>
      <p className="mt-0.5 text-xs text-[#737B73] sm:text-sm">
        {description}
      </p>
    </div>
  </div>
);

const VendorProfileClient: React.FC<VendorProfileClientProps> = ({
  vendor,
  stats,
}) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoAssetId, setLogoAssetId] = useState<string>();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [form, setForm] = useState<ProfileFields>(
    () => getInitialFields(vendor),
  );

  const existingLogoUrl = vendor.logo?.asset?._ref
    ? urlFor(vendor.logo).width(400).height(400).url()
    : null;

  const displayedLogo = logoPreview || existingLogoUrl;

  const approved = vendor.status === "approved";
  const suspended = vendor.status === "suspended";

  const storePath = vendor.slug?.current
    ? `/vendor/${vendor.slug.current}`
    : null;

  const updateField = (
    field: keyof ProfileFields,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleEdit = () => {
    setForm(getInitialFields(vendor));
    setLogoAssetId(undefined);
    setLogoPreview(null);
    setEditing(true);
  };

  const handleCancel = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }

    setForm(getInitialFields(vendor));
    setLogoAssetId(undefined);
    setLogoPreview(null);
    setEditing(false);
  };

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      input.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo must not exceed 5MB");
      input.value = "";
      return;
    }

    setLogoLoading(true);

    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);

    try {
      const result = await uploadVendorLogo(file);
      setLogoAssetId(result.assetId);
      toast.success("Store logo uploaded successfully");
    } catch (error) {
      console.error("Logo upload error:", error);

      URL.revokeObjectURL(previewUrl);
      setLogoPreview(null);
      setLogoAssetId(undefined);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to upload store logo",
      );
    } finally {
      setLogoLoading(false);
      input.value = "";
    }
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!form.businessName.trim()) {
      toast.error("Store name is required");
      return;
    }

    if (logoLoading) {
      toast.error("Please wait for the logo upload to finish");
      return;
    }

    setSaving(true);

    try {
      await updateVendorProfile({
        ...form,
        businessName: form.businessName.trim(),
        logoAssetId,
      });

      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }

      setEditing(false);
      setLogoAssetId(undefined);
      setLogoPreview(null);

      toast.success("Store profile updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Profile update error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update store profile",
      );
    } finally {
      setSaving(false);
    }
  };

  const statsCards = [
    {
      label: "Total Products",
      value: stats.totalProducts ?? 0,
      icon: Package,
      color: "bg-blue-500",
      background: "bg-blue-50",
      border: "border-blue-100",
      text: "text-blue-600",
    },
    {
      label: "Active Products",
      value: stats.activeProducts ?? 0,
      icon: ShoppingBag,
      color: "bg-green-600",
      background: "bg-green-50",
      border: "border-green-100",
      text: "text-green-700",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders ?? 0,
      icon: Store,
      color: "bg-[#F28C28]",
      background: "bg-orange-50",
      border: "border-orange-100",
      text: "text-[#E6811C]",
    },
    {
      label: "Low Stock Products",
      value: stats.lowStockCount ?? 0,
      icon: AlertTriangle,
      color: "bg-[#E26D5C]",
      background: "bg-rose-50",
      border: "border-rose-100",
      text: "text-rose-600",
    },
  ];

  const contactFields: {
    key: keyof ProfileFields;
    label: string;
    type: string;
  }[] = [
      { key: "storeEmail", label: "Contact Email", type: "email" },
      { key: "phone", label: "Phone Number", type: "tel" },
      { key: "storeAddress", label: "Store Address", type: "text" },
      { key: "storeCity", label: "City", type: "text" },
      { key: "storeState", label: "State", type: "text" },
      { key: "storeLga", label: "Local Government Area", type: "text" },
    ];

  const registeredFields: {
    key: keyof ProfileFields;
    label: string;
  }[] = [
      { key: "registeredBusinessName", label: "Registered Business Name" },
      { key: "cacRegistrationNumber", label: "CAC Registration Number" },
      { key: "taxIdentificationNumber", label: "Tax Identification Number" },
      { key: "registeredBusinessAddress", label: "Registered Address" },
      { key: "registeredBusinessCity", label: "Registered City" },
      { key: "registeredBusinessState", label: "Registered State" },
      { key: "registeredBusinessLga", label: "Registered LGA" },
    ];

  return (
    <div className="w-full space-y-6 pb-10">

      {/* PREMIUM STORE HERO */}
      <section className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-[#063C28] via-[#075232] to-[#063C28] shadow-lg">

        {/* Decorative background shapes */}
        <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full border-[35px] border-white/[0.035]" />
        <div className="pointer-events-none absolute -bottom-44 -left-16 h-80 w-80 rounded-full border-[45px] border-white/[0.035]" />
        <div className="pointer-events-none absolute right-1/3 top-0 h-full w-px bg-white/[0.06]" />

        <div className="relative z-10 flex flex-col gap-7 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:p-10">

          {/* Store identity */}
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">

            {/* Logo */}
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-[5px] border-white bg-white shadow-xl sm:h-32 sm:w-32">
              {displayedLogo ? (
                <Image
                  src={displayedLogo}
                  alt={`${vendor.businessName || "Store"} logo`}
                  width={400}
                  height={400}
                  unoptimized={Boolean(logoPreview)}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#FCF0E4]">
                  <Store className="h-12 w-12 text-[#063C28]" />
                </div>
              )}
            </div>

            {/* Store details */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="break-words text-3xl font-extrabold tracking-tight text-[#F28C28] sm:text-4xl">
                  {vendor.businessName || "Your Store"}
                </h1>

                {approved && (
                  <span
                    title="Approved vendor"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-[#063C28]"
                  >
                    <Check className="h-5 w-5" strokeWidth={3} />
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-white/85">
                {vendor.storeCategory && (
                  <span>{vendor.storeCategory}</span>
                )}

                {vendor.storeCategory && vendor.storeSubcategory && (
                  <span className="text-[#F28C28]">•</span>
                )}

                {vendor.storeSubcategory && (
                  <span>{vendor.storeSubcategory}</span>
                )}
              </div>

              {vendor.description && (
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
                  {vendor.description}
                </p>
              )}

              {/* Store URL pill */}
              {storePath && (
                <a
                  href={storePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex max-w-full items-center gap-3 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-sm text-white shadow-sm backdrop-blur-sm transition hover:border-white/50 hover:bg-white/20"
                >
                  <Globe className="h-4 w-4 shrink-0 text-[#F28C28]" />

                  <span className="shrink-0 font-semibold">
                    Store URL:
                  </span>

                  <span className="min-w-0 truncate font-medium text-emerald-200 underline decoration-emerald-200/50 underline-offset-4">
                    {storePath}
                  </span>

                  <ExternalLink className="h-4 w-4 shrink-0 text-white/80" />
                </a>
              )}
            </div>
          </div>

          {/* Status and actions */}
          <div className="flex shrink-0 flex-col gap-5 border-t border-white/15 pt-5 lg:min-w-[290px] lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold shadow-sm ${approved
                      ? "bg-[#159447] text-white"
                      : suspended
                        ? "bg-red-500 text-white"
                        : "bg-[#F28C28] text-[#34200B]"
                    }`}
                >
                  {approved ? (
                    <ShieldCheck className="h-4 w-4" />
                  ) : (
                    <Clock3 className="h-4 w-4" />
                  )}
                  {formatStatus(vendor.status)}
                </span>

                <div className="mt-3 flex items-center gap-2 text-sm text-white/75">
                  <CalendarDays className="h-4 w-4 text-[#F28C28]" />
                  <span>Joined {formatDate(vendor.createdAt)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={editing ? handleCancel : handleEdit}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#063C28] shadow-md transition hover:-translate-y-0.5 hover:bg-[#FCF0E4] disabled:opacity-60"
              >
                {editing ? (
                  <>
                    <X className="h-4 w-4" />
                    Cancel Editing
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PERFORMANCE STATISTICS */}
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {statsCards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className={`flex items-center gap-4 rounded-2xl border ${item.border} ${item.background} p-4 sm:p-5`}
            >
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${item.color} text-white shadow-sm`}>
                <Icon className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#52665A] sm:text-sm">
                  {item.label}
                </p>
                <p className={`mt-1 text-2xl font-extrabold tabular-nums ${item.text} sm:text-3xl`}>
                  {item.value.toLocaleString("en-NG")}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* PROFILE CONTENT */}
      <section className="rounded-2xl border border-[#E1E6E1] bg-white p-4 shadow-sm sm:p-6">

        {/* Profile navigation */}
        <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-[#E1E6E1] pb-5">
          <button
            type="button"
            onClick={() => {
              if (editing) handleCancel();
            }}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${!editing
                ? "bg-[#087A50] text-white shadow-sm"
                : "bg-[#F2F6F3] text-[#64756A] hover:bg-[#E8F0EA]"
              }`}
          >
            <UserRound className="h-4 w-4" />
            Profile Overview
          </button>

          <button
            type="button"
            onClick={() => {
              if (!editing) handleEdit();
            }}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${editing
                ? "bg-[#087A50] text-white shadow-sm"
                : "bg-[#F2F6F3] text-[#64756A] hover:bg-[#E8F0EA]"
              }`}
          >
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </button>
        </div>

        {!editing ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

            {/* STORE INFORMATION */}
            <section className="rounded-2xl border border-[#E1EAF0] bg-white p-5 sm:p-6">
              <SectionHeading
                icon={Store}
                title="Store Information"
                description="Your customer-facing business details"
              />

              <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2">
                <Detail
                  icon={Store}
                  label="Store Name"
                  value={vendor.businessName}
                />
                <Detail
                  icon={ShoppingBag}
                  label="Category"
                  value={vendor.storeCategory}
                />
                <Detail
                  icon={Package}
                  label="Subcategory"
                  value={vendor.storeSubcategory}
                />
                <Detail
                  icon={Mail}
                  label="Contact Email"
                  value={vendor.storeEmail || vendor.email}
                />
                <Detail
                  icon={Phone}
                  label="Phone Number"
                  value={vendor.phone}
                />
                <Detail
                  icon={MapPin}
                  label="Local Government Area"
                  value={vendor.storeLga}
                />
                <Detail
                  icon={MapPin}
                  label="City"
                  value={vendor.storeCity}
                />
                <Detail
                  icon={MapPin}
                  label="State"
                  value={vendor.storeState}
                />
                <div className="sm:col-span-2">
                  <Detail
                    icon={MapPin}
                    label="Store Address"
                    value={vendor.storeAddress}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Detail
                    icon={Edit3}
                    label="Description"
                    value={vendor.description}
                  />
                </div>
              </div>
            </section>

            {/* BUSINESS INFORMATION */}
            <section className="rounded-2xl border border-[#E1EAF0] bg-white p-5 sm:p-6">
              <SectionHeading
                icon={Building2}
                title="Business Information"
                description="Your registered business details"
              />

              <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2">
                <Detail
                  icon={Building2}
                  label="Registered Business Name"
                  value={vendor.registeredBusinessName}
                />
                <Detail
                  icon={MapPin}
                  label="Registered Address"
                  value={vendor.registeredBusinessAddress}
                />
                <Detail
                  icon={Building2}
                  label="Business Type"
                  value={vendor.businessType?.replaceAll("_", " ")}
                />
                <Detail
                  icon={MapPin}
                  label="Registered City"
                  value={vendor.registeredBusinessCity}
                />
                <Detail
                  icon={ShieldCheck}
                  label="CAC Registration Number"
                  value={vendor.cacRegistrationNumber}
                />
                <Detail
                  icon={MapPin}
                  label="Registered State"
                  value={vendor.registeredBusinessState}
                />
                <Detail
                  icon={ShieldCheck}
                  label="Tax Identification Number"
                  value={vendor.taxIdentificationNumber}
                />
                <Detail
                  icon={MapPin}
                  label="Registered LGA"
                  value={vendor.registeredBusinessLga}
                />
              </div>

              <div className="mt-6 flex gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#E6811C]" />
                <p className="text-xs leading-5 text-[#A85A0C]">
                  Your business registration details are intended for your
                  authenticated vendor account and are not intended for your
                  public storefront.
                </p>
              </div>
            </section>

            {/* ACCOUNT INFORMATION */}
            <section className="rounded-2xl border border-[#E1EAF0] bg-white p-5 sm:col-span-2 sm:p-6">
              <SectionHeading
                icon={ShieldCheck}
                title="Account Information"
                description="Your Spaazr vendor account details"
              />

              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
                <Detail
                  icon={Mail}
                  label="Account Email"
                  value={vendor.email}
                />
                <Detail
                  icon={ShieldCheck}
                  label="Vendor Status"
                  value={formatStatus(vendor.status)}
                />
                <Detail
                  icon={Globe}
                  label="Store URL Slug"
                  value={vendor.slug?.current}
                />
                <Detail
                  icon={CalendarDays}
                  label="Joined Spaazr"
                  value={formatDate(vendor.createdAt)}
                />
                <Detail
                  icon={Clock3}
                  label="Last Updated"
                  value={formatDate(vendor.updatedAt)}
                />
              </div>
            </section>
          </div>
        ) : (
          /* EDIT PROFILE FORM */
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* STORE IDENTITY */}
            <section className="rounded-2xl border border-[#E1E6E1] p-5 sm:p-6">
              <SectionHeading
                icon={Store}
                title="Store Identity"
                description="Update how customers see your store"
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="businessName" className={labelClass}>
                    Store Name *
                  </label>
                  <input
                    id="businessName"
                    value={form.businessName}
                    onChange={(e) => updateField("businessName", e.target.value)}
                    className={inputClass}
                    maxLength={100}
                    required
                    disabled={saving}
                  />
                </div>

                <div>
                  <label htmlFor="storeCategory" className={labelClass}>
                    Store Category
                  </label>
                  <input
                    id="storeCategory"
                    value={form.storeCategory}
                    onChange={(e) => updateField("storeCategory", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Food & Beverages"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label htmlFor="storeSubcategory" className={labelClass}>
                    Store Subcategory
                  </label>
                  <input
                    id="storeSubcategory"
                    value={form.storeSubcategory}
                    onChange={(e) => updateField("storeSubcategory", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Groceries"
                    disabled={saving}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className={labelClass}>
                    Store Description
                  </label>
                  <textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    className={`${inputClass} min-h-[120px] resize-y`}
                    maxLength={1000}
                    rows={4}
                    disabled={saving}
                    placeholder="Describe your store and what makes it unique..."
                  />
                  <p className="mt-1 text-right text-xs text-[#737B73]">
                    {form.description.length}/1000 characters
                  </p>
                </div>
              </div>
            </section>

            {/* LOGO */}
            <section className="rounded-2xl border border-[#E1E6E1] p-5 sm:p-6">
              <SectionHeading
                icon={ImagePlus}
                title="Store Logo"
                description="Upload your store's identity image"
              />

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#E1E6E1] bg-[#F8FAF8]">
                  {displayedLogo ? (
                    <Image
                      src={displayedLogo}
                      alt="Store logo preview"
                      width={400}
                      height={400}
                      unoptimized={Boolean(logoPreview)}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <Camera className="h-9 w-9 text-gray-400" />
                  )}
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={logoLoading || saving}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={logoLoading || saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#063C28] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0A5236] disabled:opacity-60"
                  >
                    {logoLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {logoLoading ? "Uploading..." : "Choose Logo"}
                  </button>

                  <p className="mt-2 text-xs text-[#737B73]">
                    Images only. Maximum file size: 5MB.
                  </p>
                </div>
              </div>
            </section>

            {/* CONTACT AND LOCATION */}
            <section className="rounded-2xl border border-[#E1E6E1] p-5 sm:p-6">
              <SectionHeading
                icon={MapPin}
                title="Store Contact & Location"
                description="How customers can reach and locate your store"
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {contactFields.map((field) => (
                  <div key={field.key}>
                    <label htmlFor={field.key} className={labelClass}>
                      {field.label}
                    </label>
                    <input
                      id={field.key}
                      type={field.type}
                      value={form[field.key]}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      className={inputClass}
                      disabled={saving}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* REGISTERED BUSINESS DETAILS */}
            <section className="rounded-2xl border border-[#E1E6E1] p-5 sm:p-6">
              <SectionHeading
                icon={Building2}
                title="Registered Business Details"
                description="Your official business registration information"
              />

              <div className="mb-5">
                <label htmlFor="businessType" className={labelClass}>
                  Business Type
                </label>
                <select
                  id="businessType"
                  value={form.businessType}
                  onChange={(e) => updateField("businessType", e.target.value)}
                  className={inputClass}
                  disabled={saving}
                >
                  <option value="">Select business type</option>
                  <option value="sole_proprietorship">Sole Proprietorship</option>
                  <option value="partnership">Partnership</option>
                  <option value="limited_liability_company">
                    Limited Liability Company
                  </option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {registeredFields.map((field) => (
                  <div key={field.key}>
                    <label htmlFor={field.key} className={labelClass}>
                      {field.label}
                    </label>
                    <input
                      id={field.key}
                      value={form[field.key]}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      className={inputClass}
                      disabled={saving}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* SAVE AND CANCEL */}
            <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-[#E1E6E1] bg-white/95 p-4 backdrop-blur-sm sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving || logoLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E1E6E1] bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || logoLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#063C28] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0A5236] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default VendorProfileClient;
