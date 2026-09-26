"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
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
      setCategoryTitleMap((prev) => new Map(prev).set(category._id, category.title));
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
  const buttonLabel =
    imageLoading
      ? "Uploading image..."
      : submitting
        ? isEdit
          ? "Saving Changes..."
          : "Creating Product..."
        : submitButtonLabel || defaultButtonLabel;

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div>
        <label className="block font-medium">Product Name</label>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 w-full rounded-md border p-3"
          placeholder="Enter product name"
          required
        />
      </div>

      <div>
        <label className="block font-medium">Description</label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-1 w-full rounded-md border p-3"
          rows={4}
          placeholder="Enter product description"
        />
      </div>

      <div>
        <label className="block font-medium">Price</label>
        <input
          type="number"
          min="0"
          value={price}
          onChange={(event) => setPrice(Number(event.target.value))}
          className="mt-1 w-full rounded-md border p-3"
          required
        />
      </div>

      <div>
        <label className="block font-medium">Discount (%)</label>
        <input
          type="number"
          min="0"
          max="100"
          value={discount}
          onChange={(event) => setDiscount(Number(event.target.value))}
          className="mt-1 w-full rounded-md border p-3"
        />
      </div>

      <div>
        <label className="block font-medium">Stock</label>
        <input
          type="number"
          min="0"
          value={stock}
          onChange={(event) => setStock(Number(event.target.value))}
          className="mt-1 w-full rounded-md border p-3"
          required
        />
      </div>

      <div className="relative">
        <label className="block font-medium">Brand</label>
        <input
          type="text"
          value={brandSearch}
          onChange={(event) => {
            setBrandSearch(event.target.value);
            setBrandId(undefined);
            setBrands([]);
          }}
          placeholder="Search or enter brand name"
          className="mt-1 w-full rounded-md border p-3"
        />
        {brandLoading && (
          <p className="mt-2 text-sm text-lightColor">Searching brands...</p>
        )}
        {(brands.length > 0 || (!brandLoading && brandSearch.trim())) && (
          <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-md">
            {brands.map((brand) => (
              <button
                key={brand._id}
                type="button"
                onClick={() => handleSelectBrand(brand)}
                className="block w-full px-3 py-2 text-left hover:bg-shop-light-green/10"
              >
                {brand.title}
              </button>
            ))}
            {!brands.some(
              (brand) =>
                brand.title.toLowerCase() === brandSearch.trim().toLowerCase()
            ) && (
              <button
                type="button"
                onClick={handleCreateBrand}
                disabled={creatingBrand}
                className="block w-full border-t px-3 py-2 text-left font-medium text-shop-dark-green hover:bg-shop-light-green/10"
              >
                {creatingBrand
                  ? "Adding brand..."
                  : `Add "${brandSearch.trim()}"`}
              </button>
            )}
          </div>
        )}
        {brandId && (
          <div className="mt-2 flex items-center gap-2 text-sm text-shop-dark-green">
            <span>
              Selected brand: <strong>{brandSearch}</strong>
            </span>
            <button
              type="button"
              onClick={handleClearBrand}
              className="text-xs text-rose-600 underline hover:text-rose-800"
            >
              Clear brand
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <label className="block font-medium">
          Category <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={categorySearch}
          onChange={(event) => {
            setCategorySearch(event.target.value);
            setCategories([]);
          }}
          placeholder="Search category"
          className="mt-1 w-full rounded-md border p-3"
        />
        {categoryLoading && (
          <p className="mt-2 text-sm text-lightColor">
            Searching categories...
          </p>
        )}
        {!categoryLoading && categories.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-md">
            {categories
              .filter((category) => !categoryIds.includes(category._id))
              .map((category) => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => handleSelectCategory(category)}
                  className="block w-full px-3 py-2 text-left hover:bg-shop-light-green/10"
                >
                  {category.title}
                </button>
              ))}
            {!categories.length && (
              <p className="p-3 text-sm text-lightColor">
                No categories found.
              </p>
            )}
          </div>
        )}
        {categoryIds.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {categoryIds.map((categoryId) => (
              <div
                key={categoryId}
                className="flex items-center gap-2 rounded-md bg-shop-light-green/10 px-3 py-1.5 text-sm"
              >
                <span>
                  {categoryTitleMap.get(categoryId) || categoryId}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(categoryId)}
                  className="font-semibold text-red-600 hover:text-red-800"
                  aria-label={`Remove category ${categoryTitleMap.get(categoryId) || categoryId}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block font-medium">Product Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mt-1 w-full rounded-md border p-3"
        />
        {imageLoading && (
          <p className="mt-2 text-sm text-lightColor">Uploading image...</p>
        )}
        {imageFile && !imageLoading && (
          <p className="mt-2 text-sm text-shop-dark-green">
            {imageFile.name}
          </p>
        )}
        {imageError && !imageLoading && (
          <p className="mt-2 text-sm text-rose-600">{imageError}</p>
        )}
      </div>

      <div>
        <label className="block font-medium">Status</label>
        <select
          value={status ?? ""}
          onChange={(event) =>
            setStatus(event.target.value as Product["status"])
          }
          className="mt-1 w-full rounded-md border p-3"
        >
          <option value="">Select status</option>
          <option value="new">New</option>
          <option value="hot">Hot</option>
          <option value="sale">Sale</option>
          <option value="available">Available</option>
        </select>
      </div>

      <div>
        <label className="block font-medium">Product Type</label>
        <select
          value={variant ?? ""}
          onChange={(event) =>
            setVariant(event.target.value as Product["variant"])
          }
          className="mt-1 w-full rounded-md border p-3"
        >
          <option value="">Select product type</option>
          <option value="gadget">Gadget</option>
          <option value="appliances">Appliances</option>
          <option value="refrigerator">Refrigerator</option>
          <option value="others">Others</option>
          <option value="food & beverages">Food & Beverages</option>
        </select>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isNew}
          onChange={(event) => setIsNew(event.target.checked)}
        />
        New Product
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isfeatured}
          onChange={(event) => setIsfeatured(event.target.checked)}
        />
        Featured Product
      </label>

      <button
        type="submit"
        disabled={imageLoading || submitting}
        className="rounded-md bg-shop-light-green px-5 py-3 font-semibold text-white hover:bg-shop-dark-green hoverEffect disabled:cursor-not-allowed disabled:opacity-60"
      >
        {buttonLabel}
      </button>
    </form>
  );
};

export default VendorProductForm;

