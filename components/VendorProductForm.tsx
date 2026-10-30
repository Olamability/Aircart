
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Package,
  Tag,
  ImagePlus,
  Trash2,
  CheckCircle2,
  Loader2,
  Sparkles,
  Star,
  Layers3,
  ShoppingBag,
} from "lucide-react";

import type { Product } from "@/sanity.types";
import type { VendorProductWithBrand } from "@/lib/vendorProduct";
import type { VendorProductInput } from "@/lib/validators/product";

import { uploadVendorProductImage } from "@/actions/uploadVendorProductImage";
import { searchBrands } from "@/actions/searchBrands";
import { createBrand } from "@/actions/adminTaxonomyActions";
import { searchCategories } from "@/actions/searchCategories";

export interface VendorProductFormProps {
  product?: VendorProductWithBrand | null;
  initialProduct?: VendorProductWithBrand | null;
  onSubmit: (data: VendorProductInput) => Promise<void>;
  submitButtonLabel?: string;
  successMessage?: string;
}

const inputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-shop-dark-green focus:ring-2 focus:ring-shop-dark-green/10";

const labelClass =
  "block text-xs font-semibold text-slate-700";

const VendorProductForm: React.FC<VendorProductFormProps> = ({
  product,
  initialProduct,
  onSubmit,
  submitButtonLabel,
  successMessage,
}) => {
  const router = useRouter();
  const initial = initialProduct ?? product;
  const isEdit = Boolean(initial);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [discount, setDiscount] = useState(initial?.discount ?? 0);
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [status, setStatus] = useState<Product["status"]>(initial?.status);
  const [isNew, setIsNew] = useState(initial?.isNew ?? false);
  const [variant, setVariant] = useState<Product["variant"]>(initial?.variant);
  const [isfeatured, setIsfeatured] = useState(initial?.isfeatured ?? false);

  const [brandSearch, setBrandSearch] = useState(initial?.brand?.title ?? "");
  const [brandId, setBrandId] = useState<string | undefined>(
    initial?.brand?._id ?? undefined
  );
  const [brands, setBrands] = useState<{ _id: string; title: string }[]>([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [creatingBrand, setCreatingBrand] = useState(false);

  const [categorySearch, setCategorySearch] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>(
    initial?.categories?.map((category) => category._id) ?? []
  );
  const [categories, setCategories] = useState<
    { _id: string; title: string }[]
  >([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [categoryTitleMap, setCategoryTitleMap] = useState<Map<string, string>>(
    () => {
      const map = new Map<string, string>();

      if (initial?.categories) {
        for (const cat of initial.categories) {
          map.set(cat._id, cat.title);
        }
      }

      return map;
    }
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageAssetId, setImageAssetId] = useState<string | undefined>();
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const search = brandSearch.trim();

    if (!search) {
      setBrands([]);
      return;
    }

    const timer = setTimeout(async () => {
      setBrandLoading(true);

      try {
        const results = await searchBrands(search);
        setBrands(results);
      } catch (error) {
        console.error("Error searching brands:", error);
        setBrands([]);
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

        setCategoryTitleMap((prev) => {
          const updated = new Map(prev);

          for (const cat of results) {
            updated.set(cat._id, cat.title);
          }

          return updated;
        });
      } catch (error) {
        console.error("Error searching categories:", error);
        setCategories([]);
      } finally {
        setCategoryLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [categorySearch]);

  const handleCreateBrand = async () => {
    const value = brandSearch.trim();
    if (!value) return;

    setCreatingBrand(true);

    try {
      const result = await createBrand(value);

      setBrandId(result.brand._id);
      setBrandSearch(result.brand.title);
      setBrands([]);

      toast.success(`Brand "${result.brand.title}" ready`);
    } catch (error) {
      console.error("Error creating brand:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to create brand"
      );
    } finally {
      setCreatingBrand(false);
    }
  };

  const handleSelectBrand = (brand: { _id: string; title: string }) => {
    setBrandId(brand._id);
    setBrandSearch(brand.title);
    setBrands([]);
  };

  const handleClearBrand = () => {
    setBrandId(undefined);
    setBrandSearch("");
    setBrands([]);
  };

  const handleSelectCategory = (category: { _id: string; title: string }) => {
    if (!categoryIds.includes(category._id)) {
      setCategoryIds((prev) => [...prev, category._id]);

      setCategoryTitleMap((prev) =>
        new Map(prev).set(category._id, category.title)
      );
    }

    setCategorySearch("");
    setCategories([]);
  };

  const handleRemoveCategory = (categoryId: string) => {
    setCategoryIds((prev) => prev.filter((id) => id !== categoryId));
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImageLoading(true);
    setImageError(null);

    try {
      const result = await uploadVendorProductImage(file);

      setImageAssetId(result.assetId);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading product image:", error);

      setImageFile(null);
      setImageAssetId(undefined);

      const msg =
        error instanceof Error ? error.message : "Unable to upload image";

      setImageError(msg);
      toast.error(msg);
    } finally {
      setImageLoading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (price < 0) {
      toast.error("Price must be 0 or greater");
      return;
    }

    if (stock < 0) {
      toast.error("Stock must be 0 or greater");
      return;
    }

    if (discount < 0 || discount > 100) {
      toast.error("Discount must be between 0 and 100%");
      return;
    }

    if (!categoryIds.length) {
      toast.error("Please select at least one category");
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        price,
        discount: discount !== undefined ? discount : 0,
        stock,
        status: status || undefined,
        isNew,
        variant: variant || undefined,
        isfeatured,
        brandId: brandId || undefined,
        categoryIds,
        imageAssetId: imageAssetId || undefined,
      });

      const message =
        successMessage ||
        (isEdit
          ? "Product updated successfully"
          : "Product created successfully");

      toast.success(message);

      setTimeout(() => {
        router.push("/vendor/products");
      }, 800);
    } catch (error) {
      console.error("Error saving product:", error);

      toast.error(
        error instanceof Error ? error.message : "Unable to save product"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const defaultButtonLabel = isEdit ? "Save Changes" : "Create Product";

  const buttonLabel = imageLoading
    ? "Uploading image..."
    : submitting
      ? isEdit
        ? "Saving Changes..."
        : "Creating Product..."
      : submitButtonLabel || defaultButtonLabel;

  const availableCategories = categories.filter(
    (category) => !categoryIds.includes(category._id)
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      aria-busy={submitting || imageLoading}
    >
      {/* Product details */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-shop-dark-green/10 text-shop-dark-green">
            <Package className="h-4 w-4" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Basic Information
            </h3>
            <p className="text-[11px] text-slate-500">
              Give your product a clear name and description.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="product-title" className={labelClass}>
              Product Name <span className="text-rose-500">*</span>
            </label>

            <input
              id="product-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={inputClass}
              placeholder="e.g. Samsung Galaxy S24"
              required
            />
          </div>

          <div>
            <label htmlFor="product-variant" className={labelClass}>
              Product Type
            </label>

            <select
              id="product-variant"
              value={variant ?? ""}
              onChange={(event) =>
                setVariant(event.target.value as Product["variant"])
              }
              className={inputClass}
            >
              <option value="">Select product type</option>
              <option value="gadget">Gadget</option>
              <option value="appliances">Appliances</option>
              <option value="refrigerator">Refrigerator</option>
              <option value="others">Others</option>
              <option value="food & beverages">Food &amp; Beverages</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="product-description" className={labelClass}>
              Description
              <span className="ml-1 font-normal text-slate-400">
                (Optional)
              </span>
            </label>

            <textarea
              id="product-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-1.5 min-h-[100px] w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-shop-dark-green focus:ring-2 focus:ring-shop-dark-green/10"
              rows={3}
              placeholder="Describe the product, its features and what customers should know..."
            />
          </div>
        </div>
      </section>

      {/* Pricing and inventory */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-shop-darkOrange">
            <Tag className="h-4 w-4" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Pricing &amp; Inventory
            </h3>
            <p className="text-[11px] text-slate-500">
              Set your selling price, discount and available stock.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="product-price" className={labelClass}>
              Price <span className="text-rose-500">*</span>
            </label>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                ₦
              </span>

              <input
                id="product-price"
                type="number"
                min="0"
                value={price}
                onChange={(event) => setPrice(Number(event.target.value))}
                className={`${inputClass} pl-8`}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="product-discount" className={labelClass}>
              Discount
              <span className="ml-1 font-normal text-slate-400">(%)</span>
            </label>

            <div className="relative">
              <input
                id="product-discount"
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(event) => setDiscount(Number(event.target.value))}
                className={`${inputClass} pr-10`}
                placeholder="0"
              />

              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                %
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="product-stock" className={labelClass}>
              Available Stock <span className="text-rose-500">*</span>
            </label>

            <input
              id="product-stock"
              type="number"
              min="0"
              value={stock}
              onChange={(event) => setStock(Number(event.target.value))}
              className={inputClass}
              placeholder="Enter quantity"
              required
            />
          </div>

          <div>
            <label htmlFor="product-status" className={labelClass}>
              Product Status
            </label>

            <select
              id="product-status"
              value={status ?? ""}
              onChange={(event) =>
                setStatus(event.target.value as Product["status"])
              }
              className={inputClass}
            >
              <option value="">Select status</option>
              <option value="new">New</option>
              <option value="hot">Hot</option>
              <option value="sale">Sale</option>
              <option value="available">Available</option>
            </select>
          </div>
        </div>
      </section>

      {/* Brand and category */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-shop-light-green/10 text-shop-dark-green">
            <Layers3 className="h-4 w-4" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Brand &amp; Category
            </h3>
            <p className="text-[11px] text-slate-500">
              Help customers find your product in the marketplace.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Brand */}
          <div className="relative">
            <label htmlFor="product-brand" className={labelClass}>
              Brand
              <span className="ml-1 font-normal text-slate-400">
                (Optional)
              </span>
            </label>

            <input
              id="product-brand"
              type="text"
              value={brandSearch}
              onChange={(event) => {
                setBrandSearch(event.target.value);
                setBrandId(undefined);
                setBrands([]);
              }}
              placeholder="Search or enter brand name"
              className={inputClass}
              autoComplete="off"
            />

            {brandLoading && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Searching brands...
              </p>
            )}

            {(brands.length > 0 ||
              (!brandLoading && brandSearch.trim())) && (
                <div className="absolute left-0 right-0 z-20 mt-1 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  {brands.map((brand) => (
                    <button
                      key={brand._id}
                      type="button"
                      onClick={() => handleSelectBrand(brand)}
                      className="block w-full px-3.5 py-2.5 text-left text-sm text-slate-700 transition hover:bg-shop-light-green/10 hover:text-shop-dark-green"
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
                        className="flex w-full items-center gap-2 border-t border-slate-100 px-3.5 py-2.5 text-left text-sm font-semibold text-shop-dark-green transition hover:bg-shop-light-green/10 disabled:opacity-50"
                      >
                        {creatingBrand ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <span className="text-base">+</span>
                        )}

                        {creatingBrand
                          ? "Adding brand..."
                          : `Add "${brandSearch.trim()}"`}
                      </button>
                    )}
                </div>
              )}

            {brandId && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-shop-dark-green">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-shop-light-green/10 px-2.5 py-1.5 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {brandSearch}
                </span>

                <button
                  type="button"
                  onClick={handleClearBrand}
                  className="text-xs font-medium text-rose-600 transition hover:text-rose-800"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="relative">
            <label htmlFor="product-category" className={labelClass}>
              Category <span className="text-rose-500">*</span>
            </label>

            <input
              id="product-category"
              type="text"
              value={categorySearch}
              onChange={(event) => {
                setCategorySearch(event.target.value);
                setCategories([]);
              }}
              placeholder="Search product categories"
              className={inputClass}
              autoComplete="off"
            />

            {categoryLoading && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Searching categories...
              </p>
            )}

            {!categoryLoading && categorySearch.trim() && (
              <div className="absolute left-0 right-0 z-20 mt-1 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                {availableCategories.length > 0 ? (
                  availableCategories.map((category) => (
                    <button
                      key={category._id}
                      type="button"
                      onClick={() => handleSelectCategory(category)}
                      className="block w-full px-3.5 py-2.5 text-left text-sm text-slate-700 transition hover:bg-shop-light-green/10 hover:text-shop-dark-green"
                    >
                      {category.title}
                    </button>
                  ))
                ) : (
                  <p className="px-3.5 py-3 text-xs text-slate-500">
                    No matching categories found.
                  </p>
                )}
              </div>
            )}
          </div>

          {categoryIds.length > 0 && (
            <div className="md:col-span-2">
              <p className="mb-2 text-xs font-semibold text-slate-600">
                Selected categories
              </p>

              <div className="flex flex-wrap gap-2">
                {categoryIds.map((categoryId) => {
                  const categoryName =
                    categoryTitleMap.get(categoryId) || categoryId;

                  return (
                    <div
                      key={categoryId}
                      className="inline-flex items-center gap-2 rounded-lg border border-shop-light-green/20 bg-shop-light-green/10 py-1.5 pl-3 pr-2 text-xs font-medium text-shop-dark-green"
                    >
                      <span>{categoryName}</span>

                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(categoryId)}
                        className="flex h-5 w-5 items-center justify-center rounded-md text-shop-dark-green/70 transition hover:bg-rose-100 hover:text-rose-600"
                        aria-label={`Remove category ${categoryName}`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Product image */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-shop-darkOrange">
            <ImagePlus className="h-4 w-4" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Product Image
            </h3>
            <p className="text-[11px] text-slate-500">
              Upload a clear image to showcase your product.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 transition hover:border-shop-dark-green/40 sm:p-5">
          <label
            htmlFor="product-image"
            className="flex cursor-pointer flex-col items-center justify-center text-center"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-shop-dark-green/10 text-shop-dark-green">
              {imageLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ImagePlus className="h-5 w-5" />
              )}
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-800">
              {imageLoading
                ? "Uploading your image..."
                : "Choose a product image"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Click to browse your device for an image.
            </p>

            <span className="mt-3 inline-flex items-center rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-shop-dark-green shadow-sm transition hover:bg-shop-dark-green hover:text-white">
              Browse files
            </span>
          </label>

          <input
            id="product-image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={imageLoading}
            className="sr-only"
          />

          {imageFile && !imageLoading && (
            <div className="mt-4 flex flex-col gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0" />

                <span className="truncate font-medium">
                  {imageFile.name}
                </span>
              </div>

              <span className="shrink-0 text-[11px] font-semibold text-emerald-700">
                Uploaded successfully
              </span>
            </div>
          )}

          {imageError && !imageLoading && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
              {imageError}
            </p>
          )}

          {imageLoading && (
            <p className="mt-3 text-center text-xs font-medium text-shop-dark-green">
              Please wait while your image is being uploaded.
            </p>
          )}
        </div>
      </section>

      {/* Listing options */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-shop-light-green/10 text-shop-dark-green">
            <ShoppingBag className="h-4 w-4" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Listing Options
            </h3>
            <p className="text-[11px] text-slate-500">
              Choose how your product is highlighted in the store.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-shop-dark-green/30 hover:bg-shop-dark-green/[0.02]">
            <input
              type="checkbox"
              checked={isNew}
              onChange={(event) => setIsNew(event.target.checked)}
              className="h-4 w-4 shrink-0 rounded border-slate-300 accent-shop-dark-green focus:ring-shop-dark-green"
            />

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Sparkles className="h-4 w-4" />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">
                New Product
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Highlight this as a new arrival.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-shop-dark-green/30 hover:bg-shop-dark-green/[0.02]">
            <input
              type="checkbox"
              checked={isfeatured}
              onChange={(event) => setIsfeatured(event.target.checked)}
              className="h-4 w-4 shrink-0 rounded border-slate-300 accent-shop-dark-green focus:ring-shop-dark-green"
            />

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-shop-darkOrange">
              <Star className="h-4 w-4" />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">
                Featured Product
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Highlight this product in your store.
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* Submit */}
      <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] leading-relaxed text-slate-500">
          Please review your product information before submitting.
        </p>

        <button
          type="submit"
          disabled={imageLoading || submitting}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-shop-dark-green px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-shop-light-green hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
        >
          {submitting || imageLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}

          {buttonLabel}
        </button>
      </div>
    </form>
  );
};

export default VendorProductForm;
