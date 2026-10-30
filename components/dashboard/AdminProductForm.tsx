"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Upload,
  X,
  Check,
  Plus,
  ImagePlus,
  Package,
  Store,
  Tag,
  Layers3,
  Boxes,
  Sparkles,
  AlertCircle,
  Loader2,
  Search,
} from "lucide-react";

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
  [
    "gadget",
    "appliances",
    "refrigerator",
    "food & beverages",
    "others",
  ].includes(val);

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

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-shop-dark-green focus:ring-4 focus:ring-emerald-900/10 disabled:cursor-not-allowed disabled:bg-slate-50";

const labelClass = "block text-sm font-semibold text-slate-700";

const sectionClass =
  "overflow-visible rounded-2xl border border-slate-200/80 bg-white shadow-sm";

const sectionHeadingClass =
  "flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-7";

const SectionIcon = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-shop-dark-green">
    {children}
  </div>
);

const AdminProductForm: React.FC<AdminProductFormProps> = ({
  initialData,
  vendors,
  onSubmit,
  submitLabel = "Save Product",
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [brandError, setBrandError] = useState<string | null>(null);

  // Basic product details
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [price, setPrice] = useState(initialData?.price ?? 0);
  const [discount, setDiscount] = useState(initialData?.discount ?? 0);
  const [stock, setStock] = useState(initialData?.stock ?? 0);

  const [status, setStatus] = useState<ProductStatus>(
    initialData?.status && isValidStatus(initialData.status)
      ? initialData.status
      : "available"
  );

  const [isNew, setIsNew] = useState(initialData?.isNew || false);

  const [variant, setVariant] = useState<ProductVariant>(
    initialData?.variant && isValidVariant(initialData.variant)
      ? initialData.variant
      : "others"
  );

  const [isfeatured, setIsfeatured] = useState(
    initialData?.isfeatured || false
  );

  const [vendorId, setVendorId] = useState(
    initialData?.vendorId || vendors[0]?._id || ""
  );

  // Brand
  const [brandSearch, setBrandSearch] = useState("");
  const [brandId, setBrandId] = useState<string | undefined>(
    initialData?.brandId
  );
  const [brands, setBrands] = useState<
    { _id: string; title: string }[]
  >([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [creatingBrand, setCreatingBrand] = useState(false);

  // Categories
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>(
    initialData?.categoryIds || []
  );
  const [categories, setCategories] = useState<
    { _id: string; title: string }[]
  >([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageAssetId, setImageAssetId] = useState<string | undefined>();
  const [imageLoading, setImageLoading] = useState(false);

  const existingImageUrl =
    initialData?.image && initialData.image[0]
      ? urlFor(initialData.image[0]).url()
      : null;

  const displayedImage = imagePreview || existingImageUrl;

  // Release temporary preview URLs when they are replaced or the component unmounts.
  useEffect(() => {
    if (!imagePreview) return;

    return () => {
      URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // Search brands
  useEffect(() => {
    const search = brandSearch.trim();

    if (!search) {
      setBrands([]);
      return;
    }

    const timer = setTimeout(async () => {
      setBrandLoading(true);
      setBrandError(null);

      try {
        const results = await searchBrands(search);
        setBrands(results);
      } catch (err) {
        console.error(err);
        setBrandError("Unable to search brands. Please try again.");
      } finally {
        setBrandLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [brandSearch]);

  // Search categories
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
    setBrandError(null);

    try {
      const res = await createBrand(val);

      setBrandId(res.brand._id);
      setBrandSearch(res.brand.title);
      setBrands([]);
    } catch (err) {
      console.error(err);
      setBrandError(
        err instanceof Error
          ? err.message
          : "Unable to create this brand. Please try again."
      );
    } finally {
      setCreatingBrand(false);
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageError(null);
    setImageAssetId(undefined);
    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    setImageLoading(true);

    try {
      const res = await uploadVendorProductImage(file);
      setImageAssetId(res.assetId);
    } catch (err) {
      console.error(err);
      setImageFile(null);
      setImagePreview(null);
      setImageError(
        err instanceof Error
          ? err.message
          : "Image upload failed. Please try again."
      );
    } finally {
      setImageLoading(false);
      e.target.value = "";
    }
  };

  const removeNewImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageAssetId(undefined);
    setImageError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Product title is required.");
      return;
    }

    if (!vendorId) {
      setError("Please assign a vendor to this product.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Please enter a valid product price.");
      return;
    }

    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      setError("Discount must be between 0 and 100.");
      return;
    }

    if (!Number.isFinite(stock) || stock < 0) {
      setError("Stock cannot be negative.");
      return;
    }

    if (!categoryIds.length) {
      setError("Please select at least one product category.");
      return;
    }

    if (imageLoading) {
      setError("Please wait for the image upload to finish.");
      return;
    }

    if (imageError) {
      setError("Please resolve the image upload issue before saving.");
      return;
    }

    startTransition(async () => {
      try {
        await onSubmit({
          title: title.trim(),
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
        setError(
          err instanceof Error
            ? err.message
            : "Failed to save product. Please try again."
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl space-y-6">
      {/* Form error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="font-medium">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto rounded-md p-1 text-rose-600 transition hover:bg-rose-100"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Basic details */}
      <section className={sectionClass}>
        <div className={sectionHeadingClass}>
          <SectionIcon>
            <Package className="h-5 w-5" />
          </SectionIcon>

          <div>
            <h3 className="font-semibold text-slate-900">
              Basic Product Details
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Add the essential information customers need to know.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 sm:p-7 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="product-title" className={labelClass}>
              Product Title <span className="text-rose-500">*</span>
            </label>

            <input
              id="product-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="product-vendor" className={labelClass}>
              Assign Vendor <span className="text-rose-500">*</span>
            </label>

            <select
              id="product-vendor"
              required
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a vendor</option>

              {vendors.map((vendor) => (
                <option key={vendor._id} value={vendor._id}>
                  {vendor.businessName}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs text-slate-500">
              Select the vendor responsible for this product.
            </p>
          </div>

          <div>
            <label htmlFor="product-variant" className={labelClass}>
              Product Type / Variant
            </label>

            <select
              id="product-variant"
              value={variant}
              onChange={(e) => {
                if (isValidVariant(e.target.value)) {
                  setVariant(e.target.value);
                }
              }}
              className={inputClass}
            >
              <option value="gadget">Gadget</option>
              <option value="appliances">Appliances</option>
              <option value="refrigerator">Refrigerator</option>
              <option value="food & beverages">Food & Beverages</option>
              <option value="others">Others</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="product-description" className={labelClass}>
              Product Description
            </label>

            <textarea
              id="product-description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product, its specifications, features and warranty details..."
              className={`${inputClass} min-h-32 resize-y`}
            />

            <p className="mt-2 text-xs text-slate-400">
              Provide clear and accurate information about the product.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing and inventory */}
      <section className={sectionClass}>
        <div className={sectionHeadingClass}>
          <SectionIcon>
            <Boxes className="h-5 w-5" />
          </SectionIcon>

          <div>
            <h3 className="font-semibold text-slate-900">
              Pricing & Inventory
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Set the selling price, discount and available stock.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-7 md:grid-cols-3">
          <div>
            <label htmlFor="product-price" className={labelClass}>
              Price (₦) <span className="text-rose-500">*</span>
            </label>

            <input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="product-discount" className={labelClass}>
              Discount (%)
            </label>

            <input
              id="product-discount"
              type="number"
              min="0"
              max="100"
              step="1"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className={inputClass}
            />

            <p className="mt-2 text-xs text-slate-400">
              Enter a value between 0 and 100.
            </p>
          </div>

          <div>
            <label htmlFor="product-stock" className={labelClass}>
              Stock Units <span className="text-rose-500">*</span>
            </label>

            <input
              id="product-stock"
              type="number"
              min="0"
              step="1"
              required
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Taxonomy and branding */}
      <section className={sectionClass}>
        <div className={sectionHeadingClass}>
          <SectionIcon>
            <Layers3 className="h-5 w-5" />
          </SectionIcon>

          <div>
            <h3 className="font-semibold text-slate-900">
              Taxonomy & Branding
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Organise the product so customers can discover it easily.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-5 sm:p-7 md:grid-cols-2">
          {/* Brand */}
          <div className="relative">
            <label htmlFor="brand-search" className={labelClass}>
              Product Brand
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                id="brand-search"
                type="text"
                value={brandSearch}
                onChange={(e) => {
                  setBrandSearch(e.target.value);
                  setBrandId(undefined);
                  setBrandError(null);
                }}
                placeholder={
                  brandId
                    ? "Existing brand assigned — search to change"
                    : "Search or enter a brand..."
                }
                className={`${inputClass} pl-10`}
              />
            </div>

            {brandError && (
              <p className="mt-2 text-xs font-medium text-rose-600">
                {brandError}
              </p>
            )}

            {(brands.length > 0 ||
              brandLoading ||
              (brandSearch.trim() && !brandId)) && (
                <div className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  {brandLoading ? (
                    <div className="flex items-center gap-2 px-3 py-3 text-xs text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching brands...
                    </div>
                  ) : (
                    <>
                      {brands.map((brand) => (
                        <button
                          key={brand._id}
                          type="button"
                          onClick={() => {
                            setBrandId(brand._id);
                            setBrandSearch(brand.title);
                            setBrands([]);
                            setBrandError(null);
                          }}
                          className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-emerald-50 hover:text-shop-dark-green"
                        >
                          {brand.title}
                        </button>
                      ))}

                      {!brands.some(
                        (brand) =>
                          brand.title.toLowerCase() ===
                          brandSearch.trim().toLowerCase()
                      ) && (
                          <button
                            type="button"
                            onClick={handleCreateBrand}
                            disabled={creatingBrand}
                            className="flex w-full items-center gap-2 rounded-lg border-t border-slate-100 px-3 py-3 text-left text-sm font-semibold text-shop-dark-green transition hover:bg-emerald-50 disabled:opacity-50"
                          >
                            {creatingBrand ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}

                            {creatingBrand
                              ? "Creating brand..."
                              : `Create "${brandSearch.trim()}"`}
                          </button>
                        )}
                    </>
                  )}
                </div>
              )}

            {brandId && !brandSearch && (
              <p className="mt-2 text-xs text-emerald-700">
                An existing brand is assigned to this product.
              </p>
            )}
          </div>

          {/* Categories */}
          <div className="relative">
            <label htmlFor="category-search" className={labelClass}>
              Product Categories <span className="text-rose-500">*</span>
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                id="category-search"
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search categories to add..."
                className={`${inputClass} pl-10`}
              />
            </div>

            {(categories.length > 0 || categoryLoading) && (
              <div className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                {categoryLoading ? (
                  <div className="flex items-center gap-2 px-3 py-3 text-xs text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching categories...
                  </div>
                ) : (
                  categories.map((category) => {
                    const selected = categoryIds.includes(category._id);

                    return (
                      <button
                        key={category._id}
                        type="button"
                        onClick={() => {
                          if (!selected) {
                            setCategoryIds((prev) => [
                              ...prev,
                              category._id,
                            ]);
                          }

                          setCategorySearch("");
                          setCategories([]);
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-emerald-50"
                      >
                        <span>{category.title}</span>

                        {selected && (
                          <Check className="h-4 w-4 text-emerald-600" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {categoryIds.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {categoryIds.map((id) => {
                  const category = categories.find(
                    (item) => item._id === id
                  );

                  return (
                    <span
                      key={id}
                      className="inline-flex max-w-full items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800"
                    >
                      <Tag className="h-3.5 w-3.5 shrink-0" />

                      <span className="max-w-40 truncate">
                        {category?.title || "Existing category"}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setCategoryIds((prev) =>
                            prev.filter((categoryId) => categoryId !== id)
                          )
                        }
                        className="rounded p-0.5 text-emerald-700 transition hover:bg-emerald-100 hover:text-rose-600"
                        aria-label="Remove category"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            <p className="mt-2 text-xs text-slate-400">
              Select at least one category for this product.
            </p>
          </div>
        </div>
      </section>

      {/* Media and badges */}
      <section className={sectionClass}>
        <div className={sectionHeadingClass}>
          <SectionIcon>
            <ImagePlus className="h-5 w-5" />
          </SectionIcon>

          <div>
            <h3 className="font-semibold text-slate-900">
              Media & Product Badges
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Upload a product image and configure its storefront visibility.
            </p>
          </div>
        </div>

        <div className="space-y-7 p-5 sm:p-7">
          {/* Image upload */}
          <div>
            <label className={labelClass}>Product Image</label>

            <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="relative flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 sm:w-40">
                {displayedImage ? (
                  <>
                    <Image
                      src={displayedImage}
                      alt="Product preview"
                      fill
                      sizes="160px"
                      className="object-cover"
                    />

                    {imagePreview && (
                      <button
                        type="button"
                        onClick={removeNewImage}
                        className="absolute right-2 top-2 z-10 rounded-full bg-white/95 p-1.5 text-slate-700 shadow transition hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Remove selected image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <ImagePlus className="h-8 w-8" strokeWidth={1.5} />
                    <span className="text-xs font-medium">
                      Image preview
                    </span>
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-shop-dark-green">
                  {imageLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}

                  {imageLoading
                    ? "Uploading image..."
                    : imageFile
                      ? "Choose another image"
                      : displayedImage
                        ? "Replace image"
                        : "Choose product image"}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={imageLoading}
                    className="hidden"
                  />
                </label>

                <p className="text-xs leading-5 text-slate-500">
                  Upload a clear product image that represents the item
                  accurately.
                </p>

                {imageFile && !imageError && !imageLoading && (
                  <p className="max-w-full truncate text-xs font-medium text-emerald-700">
                    <Check className="mr-1 inline h-3.5 w-3.5" />
                    Image uploaded successfully
                  </p>
                )}

                {imageLoading && (
                  <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Uploading your image. Please wait...
                  </p>
                )}

                {imageError && (
                  <p className="flex items-start gap-2 text-xs font-medium text-rose-600">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {imageError}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Status and badges */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="product-status" className={labelClass}>
                Product Status
              </label>

              <select
                id="product-status"
                value={status}
                onChange={(e) => {
                  if (isValidStatus(e.target.value)) {
                    setStatus(e.target.value);
                  }
                }}
                className={inputClass}
              >
                <option value="available">Available</option>
                <option value="new">New</option>
                <option value="hot">Hot</option>
                <option value="sale">Sale</option>
              </select>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-shop-dark-green accent-emerald-700 focus:ring-emerald-500"
              />

              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  New Arrival
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Mark this product as a new addition to the store.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40">
              <input
                type="checkbox"
                checked={isfeatured}
                onChange={(e) => setIsfeatured(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-shop-dark-green accent-emerald-700 focus:ring-emerald-500"
              />

              <span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                  Featured Product
                  <Sparkles className="h-3.5 w-3.5 text-shop-darkOrange" />
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Highlight this product on the storefront.
                </span>
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="sticky bottom-0 z-10 -mx-2 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white/95 px-2 py-4 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:justify-end sm:border-0 sm:bg-transparent sm:px-0 sm:py-2 sm:backdrop-blur-none">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isPending || imageLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-shop-dark-green px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-shop-light-green hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending || imageLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {imageLoading ? "Uploading image..." : "Saving product..."}
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default AdminProductForm;