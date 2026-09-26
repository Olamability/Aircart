"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Check, Search, Plus } from "lucide-react";
import { searchBrands } from "@/actions/searchBrands";
import { createBrand } from "@/actions/adminTaxonomyActions";
import { searchCategories } from "@/actions/searchCategories";
import { uploadVendorProductImage } from "@/actions/uploadVendorProductImage";
import { urlFor } from "@/sanity/lib/image";
import type { AdminProductInput } from "@/actions/adminProductActions";
import type { Product } from "@/sanity.types";

type ProductStatus = NonNullable<AdminProductInput["status"]>;
type ProductVariant = NonNullable<AdminProductInput["variant"]>;

const isValidStatus = (val: string): val is ProductStatus =>
  ["available", "new", "hot", "sale"].includes(val);

const isValidVariant = (val: string): val is ProductVariant =>
  ["gadget", "appliances", "refrigerator", "food & beverages", "others"].includes(val);

interface AdminProductFormProps {
  initialData?: {
    _id?: string;
    title?: string;
    description?: string;
    price?: number;
    discount?: number;
    stock?: number;
    status?: ProductStatus;
    isNew?: boolean;
    variant?: ProductVariant;
    isfeatured?: boolean;
    vendorId?: string;
    brandId?: string;
    categoryIds?: string[];
    image?: Product["image"];
  };
  vendors: Array<{ _id: string; businessName: string }>;
  onSubmit: (data: AdminProductInput) => Promise<void>;
  submitLabel?: string;
}

const AdminProductForm: React.FC<AdminProductFormProps> = ({
  initialData,
  vendors,
  onSubmit,
  submitLabel = "Save Product",
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price ?? 0);
  const [discount, setDiscount] = useState(initialData?.discount ?? 0);
  const [stock, setStock] = useState(initialData?.stock ?? 0);
  const [status, setStatus] = useState<ProductStatus>(
    initialData?.status && isValidStatus(initialData.status) ? initialData.status : "available"
  );
  const [isNew, setIsNew] = useState(initialData?.isNew || false);
  const [variant, setVariant] = useState<ProductVariant>(
    initialData?.variant && isValidVariant(initialData.variant) ? initialData.variant : "others"
  );
  const [isfeatured, setIsfeatured] = useState(initialData?.isfeatured || false);
  const [vendorId, setVendorId] = useState(initialData?.vendorId || vendors[0]?._id || "");

  // Brand state
  const [brandSearch, setBrandSearch] = useState("");
  const [brandId, setBrandId] = useState<string | undefined>(initialData?.brandId);
  const [brands, setBrands] = useState<{ _id: string; title: string }[]>([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [creatingBrand, setCreatingBrand] = useState(false);

  // Categories state
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>(initialData?.categoryIds || []);
  const [categories, setCategories] = useState<{ _id: string; title: string }[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageAssetId, setImageAssetId] = useState<string | undefined>();
  const [imageLoading, setImageLoading] = useState(false);
  const [existingImageUrl] = useState<string | null>(
    initialData?.image && initialData.image[0] ? urlFor(initialData.image[0]).url() : null
  );

  useEffect(() => {
    const search = brandSearch.trim();
    if (!search) return;
    const timer = setTimeout(async () => {
      setBrandLoading(true);
      try {
        const results = await searchBrands(search);
        setBrands(results);
      } catch (err) {
        console.error(err);
      } finally {
        setBrandLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [brandSearch]);

  useEffect(() => {
    const search = categorySearch.trim();
    if (!search) {
      setCategories([]);
      return;
    }
    const timer = setTimeout(async () => {
      setCategoryLoading(true);
      try {
        const results = await searchCategories(search);
        setCategories(results);
      } catch (err) {
        console.error(err);
      } finally {
        setCategoryLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [categorySearch]);

  const handleCreateBrand = async () => {
    const val = brandSearch.trim();
    if (!val) return;
    setCreatingBrand(true);
    try {
      const res = await createBrand(val);
      setBrandId(res.brand._id);
      setBrandSearch(res.brand.title);
      setBrands([]);
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingBrand(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImageLoading(true);
    try {
      const res = await uploadVendorProductImage(file);
      setImageAssetId(res.assetId);
    } catch (err) {
      console.error(err);
      setImageFile(null);
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Product title is required");
      return;
    }
    if (!vendorId) {
      setError("Please assign a vendor to this product");
      return;
    }
    if (price < 0) {
      setError("Price cannot be negative");
      return;
    }
    if (stock < 0) {
      setError("Stock cannot be negative");
      return;
    }
    if (!categoryIds.length) {
      setError("At least one category is required");
      return;
    }

    startTransition(async () => {
      try {
        await onSubmit({
          title,
          description,
          price: Number(price),
          discount: Number(discount),
          stock: Number(stock),
          status,
          isNew,
          variant,
          isfeatured,
          vendorId,
          brandId,
          categoryIds,
          imageAssetId,
        });
        router.push("/admin/products");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save product");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Basic Product Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Product Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Assign Vendor *</label>
            <select
              required
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Select a vendor</option>
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.businessName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Product Type / Variant</label>
            <select
              value={variant}
              onChange={(e) => {
                if (isValidVariant(e.target.value)) {
                  setVariant(e.target.value);
                }
              }}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="gadget">Gadget</option>
              <option value="appliances">Appliances</option>
              <option value="refrigerator">Refrigerator</option>
              <option value="food & beverages">Food & Beverages</option>
              <option value="others">Others</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Comprehensive product specifications, features, and warranty details..."
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Pricing & Inventory
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700">Price (₦) *</label>
            <input
              type="number"
              min="0"
              required
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Discount (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Stock Units *</label>
            <input
              type="number"
              min="0"
              required
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Taxonomy & Branding
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Brand Search/Select */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700">Brand</label>
            <input
              type="text"
              value={brandSearch}
              onChange={(e) => {
                setBrandSearch(e.target.value);
                setBrandId(undefined);
              }}
              placeholder="Search or enter new brand..."
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />

            {(brands.length > 0 || brandLoading || brandSearch.trim()) && (
              <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                {brandLoading ? (
                  <p className="p-2 text-xs text-slate-500">Searching brands...</p>
                ) : (
                  <>
                    {brands.map((b) => (
                      <button
                        key={b._id}
                        type="button"
                        onClick={() => {
                          setBrandId(b._id);
                          setBrandSearch(b.title);
                          setBrands([]);
                        }}
                        className="flex w-full items-center px-3 py-1.5 text-left text-sm hover:bg-slate-50 rounded"
                      >
                        {b.title}
                      </button>
                    ))}
                    {!brands.some((b) => b.title.toLowerCase() === brandSearch.trim().toLowerCase()) && (
                      <button
                        type="button"
                        onClick={handleCreateBrand}
                        disabled={creatingBrand}
                        className="flex w-full items-center gap-1.5 border-t border-slate-100 px-3 py-2 text-left text-xs font-semibold text-shop-dark-green hover:bg-emerald-50 rounded"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {creatingBrand ? "Adding..." : `Create "${brandSearch.trim()}"`}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Category Search/Select */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700">Categories *</label>
            <input
              type="text"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="Search category to add..."
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />

            {(categories.length > 0 || categoryLoading) && (
              <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                {categoryLoading ? (
                  <p className="p-2 text-xs text-slate-500">Searching...</p>
                ) : (
                  categories.map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => {
                        if (!categoryIds.includes(c._id)) {
                          setCategoryIds((prev) => [...prev, c._id]);
                        }
                        setCategorySearch("");
                        setCategories([]);
                      }}
                      className="flex w-full items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-slate-50 rounded"
                    >
                      <span>{c.title}</span>
                      {categoryIds.includes(c._id) && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                    </button>
                  ))
                )}
              </div>
            )}

            {categoryIds.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {categoryIds.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 border border-emerald-200"
                  >
                    <span>Selected Category</span>
                    <button
                      type="button"
                      onClick={() => setCategoryIds((prev) => prev.filter((i) => i !== id))}
                      className="text-emerald-700 hover:text-emerald-900 font-bold"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Media & Badges
        </h3>

        <div>
          <label className="block text-sm font-medium text-slate-700">Product Image</label>
          <div className="mt-2 flex items-center gap-4">
            {existingImageUrl && !imageFile && (
              <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200">
                <Image src={existingImageUrl} alt="Product" fill className="object-cover" />
              </div>
            )}
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition">
              <Upload className="h-4 w-4 text-slate-500" />
              <span>{imageFile ? imageFile.name : "Choose Image"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {imageLoading && <span className="text-xs text-slate-500 animate-pulse">Uploading...</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <select
              value={status}
              onChange={(e) => {
                if (isValidStatus(e.target.value)) {
                  setStatus(e.target.value);
                }
              }}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
            >
              <option value="available">Available</option>
              <option value="new">New</option>
              <option value="hot">Hot</option>
              <option value="sale">Sale</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="isNewCheck"
              checked={isNew}
              onChange={(e) => setIsNew(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-shop-dark-green focus:ring-emerald-500"
            />
            <label htmlFor="isNewCheck" className="text-sm font-medium text-slate-700 cursor-pointer">
              Mark as New Arrival
            </label>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="isFeaturedCheck"
              checked={isfeatured}
              onChange={(e) => setIsfeatured(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-shop-dark-green focus:ring-emerald-500"
            />
            <label htmlFor="isFeaturedCheck" className="text-sm font-medium text-slate-700 cursor-pointer">
              Featured on Storefront
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || imageLoading}
          className="rounded-lg bg-shop-dark-green px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-shop-light-green transition disabled:opacity-50"
        >
          {isPending ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default AdminProductForm;
