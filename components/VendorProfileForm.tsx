
"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Building2,
  ImagePlus,
  Loader2,
  Save,
  Store,
  Upload,
  X,
} from "lucide-react";

import { uploadVendorLogo } from "@/actions/uploadVendorLogo";
import { updateVendorProfile } from "@/actions/updateVendorProfile";
import { urlFor } from "@/sanity/lib/image";

interface VendorProfileFormProps {
  vendor: {
    businessName?: string;
    description?: string;
    logo?: { asset?: { _ref: string; _type: "reference" } };
  } | null;
}

const VendorProfileForm: React.FC<VendorProfileFormProps> = ({ vendor }) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isNewVendor = !vendor;

  const [businessName, setBusinessName] = useState(
    vendor?.businessName ?? "",
  );
  const [description, setDescription] = useState(
    vendor?.description ?? "",
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoAssetId, setLogoAssetId] = useState<string>();
  const [logoLoading, setLogoLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const existingLogoUrl = vendor?.logo?.asset?._ref
    ? urlFor(vendor.logo).width(400).height(400).url()
    : null;

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

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

    setLogoFile(file);
    setLogoLoading(true);

    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);

    try {
      const result = await uploadVendorLogo(file);
      setLogoAssetId(result.assetId);
      toast.success("Vendor logo uploaded successfully");
    } catch (error) {
      console.error("Error uploading vendor logo:", error);

      setLogoFile(null);
      setLogoAssetId(undefined);
      setLogoPreview(null);

      URL.revokeObjectURL(previewUrl);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to upload vendor logo",
      );
    } finally {
      setLogoLoading(false);
      input.value = "";
    }
  };

  const removeSelectedLogo = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoPreview(null);
    setLogoFile(null);
    setLogoAssetId(undefined);
  };

  const handleSubmit = async (
    event: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!businessName.trim()) {
      toast.error("Business name is required");
      return;
    }

    setSaving(true);

    try {
      await updateVendorProfile({
        businessName: businessName.trim(),
        description: description.trim(),
        logoAssetId,
      });

      toast.success(
        isNewVendor
          ? "Store profile created successfully!"
          : "Vendor profile updated successfully",
      );

      setTimeout(() => {
        router.push("/vendor");
      }, 800);
    } catch (error) {
      console.error("Error updating vendor profile:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update vendor profile",
      );

      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-shop-border bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-shop-dark-green focus:ring-2 focus:ring-shop-dark-green/10 disabled:cursor-not-allowed disabled:bg-gray-50";

  const labelClass =
    "mb-2 block text-sm font-semibold text-gray-700";

  const displayedLogo = logoPreview || existingLogoUrl;

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-7">
      {/* Business Information */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-shop-dark-green/10">
            <Building2 className="h-5 w-5 text-shop-dark-green" />
          </div>

          <div>
            <h3 className="font-semibold text-shop-dark-green">
              Business Information
            </h3>
            <p className="text-xs text-lightColor">
              Provide the details customers will see about your store.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Business Name */}
          <div>
            <label htmlFor="businessName" className={labelClass}>
              Business Name <span className="text-red-500">*</span>
            </label>

            <input
              id="businessName"
              type="text"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              className={inputClass}
              placeholder="e.g. Ability Gadgets"
              autoComplete="organization"
              maxLength={100}
              required
              disabled={saving}
            />

            <p className="mt-1.5 text-xs text-lightColor">
              Use the name customers recognise your business by.
            </p>
          </div>

          {/* Description */}
          <div className="lg:row-span-2">
            <label htmlFor="description" className={labelClass}>
              Business Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={`${inputClass} min-h-[150px] resize-y`}
              rows={5}
              placeholder="Tell customers what your business offers, the products you sell and what makes your store unique..."
              maxLength={1000}
              disabled={saving}
            />

            <p className="mt-1.5 text-right text-xs text-lightColor">
              {description.length}/1000 characters
            </p>
          </div>
        </div>
      </section>

      <div className="border-t border-shop-border" />

      {/* Store Branding */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-shop-dark-green/10">
            <Store className="h-5 w-5 text-shop-dark-green" />
          </div>

          <div>
            <h3 className="font-semibold text-shop-dark-green">
              Store Branding
            </h3>
            <p className="text-xs text-lightColor">
              Upload a logo to help customers identify your store.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 rounded-2xl border border-dashed border-shop-border bg-gray-50/70 p-4 sm:flex-row sm:items-center sm:p-5">
          {/* Logo Preview */}
          <div className="flex h-28 w-28 shrink-0 items-center justify-center self-center overflow-hidden rounded-2xl border border-shop-border bg-white shadow-sm sm:self-auto">
            {displayedLogo ? (
              <Image
                src={displayedLogo}
                alt={`${businessName || "Vendor"} logo`}
                width={400}
                height={400}
                unoptimized={Boolean(logoPreview)}
                className="h-full w-full object-contain p-2"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <ImagePlus className="h-8 w-8" />
                <span className="text-[10px] font-medium">
                  No logo yet
                </span>
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h4 className="text-sm font-semibold text-gray-800">
              {logoFile ? logoFile.name : "Upload your store logo"}
            </h4>

            <p className="mt-1 text-xs leading-5 text-lightColor">
              Choose a clear image that represents your business. A square
              image with a transparent or clean background works well.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-shop-dark-green px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-shop-light-green disabled:cursor-not-allowed disabled:opacity-60"
              >
                {logoLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}

                {logoLoading ? "Uploading..." : "Choose Logo"}
              </button>

              {logoPreview && !logoLoading && (
                <button
                  type="button"
                  onClick={removeSelectedLogo}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-shop-border bg-white px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:border-red-200 hover:text-red-600 disabled:opacity-60"
                >
                  <X className="h-4 w-4" />
                  Remove selection
                </button>
              )}
            </div>

            {logoLoading && (
              <p className="mt-2 text-xs font-medium text-shop-dark-green">
                Uploading your logo. Please wait...
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="flex flex-col-reverse gap-3 border-t border-shop-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-lightColor">
          {isNewVendor
            ? "Complete your details to establish your store on Spaazr."
            : "Review your changes before saving your store profile."}
        </p>

        <button
          type="submit"
          disabled={saving || logoLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-shop-light-green px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-shop-dark-green disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isNewVendor ? "Creating Profile..." : "Saving Changes..."}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isNewVendor ? "Complete Store Profile" : "Save Changes"}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default VendorProfileForm;
