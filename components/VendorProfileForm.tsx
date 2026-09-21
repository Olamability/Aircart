"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { uploadVendorLogo } from "@/actions/uploadVendorLogo";
import { updateVendorProfile } from "@/actions/updateVendorProfile";
import { urlFor } from "@/sanity/lib/image";
interface VendorProfileFormProps {
  vendor: {
    businessName?: string;
    description?: string;
    logo?: { asset?: { _ref: string; _type: "reference" } };
  };
}
const VendorProfileForm: React.FC<VendorProfileFormProps> = ({ vendor }) => {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(vendor.businessName ?? "");
  const [description, setDescription] = useState(vendor.description ?? "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoAssetId, setLogoAssetId] = useState<string>();
  const [logoLoading, setLogoLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoLoading(true);
    try {
      const result = await uploadVendorLogo(file);
      setLogoAssetId(result.assetId);
      toast.success("Vendor logo uploaded successfully");
    } catch (error) {
      console.error("Error uploading vendor logo:", error);
      setLogoFile(null);
      setLogoAssetId(undefined);
      toast.error(
        error instanceof Error ? error.message : "Unable to upload vendor logo",
      );
    } finally {
      setLogoLoading(false);
    }
  };
  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateVendorProfile({ businessName, description, logoAssetId });
      toast.success("Vendor profile updated successfully");
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
  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-5">
      {" "}
      <div>
        {" "}
        <label className="block font-medium">Vendor Logo</label>{" "}
        {vendor.logo?.asset?._ref && (
          <div className="mt-2 flex h-32 w-32 items-center justify-center overflow-hidden rounded-md border bg-white">
            {" "}
            <Image
              src={urlFor(vendor.logo).width(200).height(200).url()}
              alt={`${vendor.businessName ?? "Vendor"} logo`}
              width={200}
              height={200}
              className="h-full w-full object-contain"
            />{" "}
          </div>
        )}{" "}
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="mt-3 w-full rounded-md border p-3"
        />{" "}
        {logoLoading && (
          <p className="mt-2 text-sm text-lightColor"> Uploading logo... </p>
        )}{" "}
        {logoFile && !logoLoading && (
          <p className="mt-2 text-sm text-shop-dark-green"> {logoFile.name} </p>
        )}{" "}
      </div>{" "}
      <div>
        {" "}
        <label className="block font-medium">Business Name</label>{" "}
        <input
          type="text"
          value={businessName}
          onChange={(event) => setBusinessName(event.target.value)}
          className="mt-1 w-full rounded-md border p-3"
          placeholder="Enter your business name"
        />{" "}
      </div>{" "}
      <div>
        {" "}
        <label className="block font-medium">Business Description</label>{" "}
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-1 w-full rounded-md border p-3"
          rows={5}
          placeholder="Tell customers about your business"
        />{" "}
      </div>{" "}
      <button
        type="submit"
        disabled={saving || logoLoading}
        className="rounded-md bg-shop-light-green px-5 py-3 font-semibold text-white hover:bg-shop-dark-green hoverEffect disabled:cursor-not-allowed disabled:opacity-60"
      >
        {" "}
        {saving ? "Saving..." : "Save Changes"}{" "}
      </button>{" "}
    </form>
  );
};
export default VendorProfileForm;
