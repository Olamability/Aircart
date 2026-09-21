"use client";
import React, { useEffect, useState } from "react";
import type { Product } from "@/sanity.types";
import { searchBrands } from "@/actions/searchBrands";
import { createVendorBrand } from "@/actions/createVendorBrand";
import { uploadVendorProductImage } from "@/actions/uploadVendorProductImage";
import { searchCategories } from "@/actions/searchCategories";
interface VendorCreateProductFormProps {
  onSubmit: (data: {
    title: string;
    description?: string;
    price: number;
    discount?: number;
    stock: number;
    status?: Product["status"];
    isNew?: boolean;
    variant?: Product["variant"];
    isfeatured?: boolean;
    brandId?: string;
    categoryIds: string[];
  }) => Promise<void>;
}
const VendorCreateProductForm: React.FC<VendorCreateProductFormProps> = ({
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [stock, setStock] = useState(0);
  const [status, setStatus] = useState<Product["status"]>();
  const [isNew, setIsNew] = useState(false);
  const [variant, setVariant] = useState<Product["variant"]>();
  const [isfeatured, setIsfeatured] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [brandId, setBrandId] = useState<string>();
  const [brands, setBrands] = useState<{ _id: string; title: string }[]>([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [creatingBrand, setCreatingBrand] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<
    { _id: string; title: string }[]
  >([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageAssetId, setImageAssetId] = useState<string>();
  const [imageLoading, setImageLoading] = useState(false);
  useEffect(() => {
    const search = brandSearch.trim();
    if (!search) {
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
      const result = await createVendorBrand(value);
      setBrandId(result.brand._id);
      setBrandSearch(result.brand.title);
      setBrands([]);
    } catch (error) {
      console.error("Error creating brand:", error);
    } finally {
      setCreatingBrand(false);
    }
  };
  const handleSelectBrand = (brand: { _id: string; title: string }) => {
    setBrandId(brand._id);
    setBrandSearch(brand.title);
    setBrands([]);
  };
  const handleSelectCategory = (category: { _id: string; title: string }) => {
    if (!categoryIds.includes(category._id)) {
      setCategoryIds((current) => [...current, category._id]);
    }
    setCategorySearch("");
    setCategories([]);
  };
  const handleRemoveCategory = (categoryId: string) => {
    setCategoryIds((current) => current.filter((id) => id !== categoryId));
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!categoryIds.length) {
      console.error("At least one category is required");
      return;
    }
    await onSubmit({
      title,
      description,
      price,
      discount,
      stock,
      status,
      isNew,
      variant,
      isfeatured,
      brandId,
      categoryIds,
    });
  };
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImageLoading(true);
    try {
      const result = await uploadVendorProductImage(file);
      setImageAssetId(result.assetId);
    } catch (error) {
      console.error("Error uploading product image:", error);
      setImageFile(null);
      setImageAssetId(undefined);
    } finally {
      setImageLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      {" "}
      <div>
        {" "}
        <label className="block font-medium">Product Name</label>{" "}
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 w-full rounded-md border p-3"
        />{" "}
      </div>{" "}
      <div>
        {" "}
        <label className="block font-medium">Description</label>{" "}
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-1 w-full rounded-md border p-3"
          rows={4}
        />{" "}
      </div>{" "}
      <div>
        {" "}
        <label className="block font-medium">Price</label>{" "}
        <input
          type="number"
          min="0"
          value={price}
          onChange={(event) => setPrice(Number(event.target.value))}
          className="mt-1 w-full rounded-md border p-3"
        />{" "}
      </div>{" "}
      <div>
        {" "}
        <label className="block font-medium">Discount (%)</label>{" "}
        <input
          type="number"
          min="0"
          max="100"
          value={discount}
          onChange={(event) => setDiscount(Number(event.target.value))}
          className="mt-1 w-full rounded-md border p-3"
        />{" "}
      </div>{" "}
      <div>
        {" "}
        <label className="block font-medium">Stock</label>{" "}
        <input
          type="number"
          min="0"
          value={stock}
          onChange={(event) => setStock(Number(event.target.value))}
          className="mt-1 w-full rounded-md border p-3"
        />{" "}
      </div>{" "}
      <div className="relative">
        {" "}
        <label className="block font-medium">Brand</label>{" "}
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
        />{" "}
        {(brands.length > 0 || brandLoading || brandSearch.trim()) && (
          <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-md">
            {" "}
            {brandLoading ? (
              <p className="p-3 text-sm text-lightColor">
                {" "}
                Searching brands...{" "}
              </p>
            ) : (
              <>
                {" "}
                {brands.map((brand) => (
                  <button
                    key={brand._id}
                    type="button"
                    onClick={() => handleSelectBrand(brand)}
                    className="block w-full px-3 py-2 text-left hover:bg-shop-light-green/10"
                  >
                    {" "}
                    {brand.title}{" "}
                  </button>
                ))}{" "}
                {!brands.some(
                  (brand) =>
                    brand.title.toLowerCase() ===
                    brandSearch.trim().toLowerCase(),
                ) && (
                  <button
                    type="button"
                    onClick={handleCreateBrand}
                    disabled={creatingBrand}
                    className="block w-full border-t px-3 py-2 text-left font-medium text-shop-dark-green hover:bg-shop-light-green/10"
                  >
                    {" "}
                    {creatingBrand
                      ? "Adding brand..."
                      : `Add "${brandSearch.trim()}"`}{" "}
                  </button>
                )}{" "}
              </>
            )}{" "}
          </div>
        )}{" "}
      </div>{" "}
      <div className="relative">
        {" "}
        <label className="block font-medium"> Category </label>{" "}
        <input
          type="text"
          value={categorySearch}
          onChange={(event) => setCategorySearch(event.target.value)}
          placeholder="Search category"
          className="mt-1 w-full rounded-md border p-3"
        />{" "}
        {(categories.length > 0 ||
          categoryLoading ||
          categorySearch.trim()) && (
          <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-md">
            {" "}
            {categoryLoading ? (
              <p className="p-3 text-sm text-lightColor">
                {" "}
                Searching categories...{" "}
              </p>
            ) : (
              <>
                {" "}
                {categories.map((category) => (
                  <button
                    key={category._id}
                    type="button"
                    onClick={() => handleSelectCategory(category)}
                    disabled={categoryIds.includes(category._id)}
                    className="block w-full px-3 py-2 text-left hover:bg-shop-light-green/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {" "}
                    {category.title}{" "}
                  </button>
                ))}{" "}
                {!categories.length && (
                  <p className="p-3 text-sm text-lightColor">
                    {" "}
                    No categories found.{" "}
                  </p>
                )}{" "}
              </>
            )}{" "}
          </div>
        )}{" "}
        {categoryIds.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {" "}
            {categoryIds.map((categoryId) => (
              <div
                key={categoryId}
                className="flex items-center gap-2 rounded-md bg-shop-light-green/10 px-3 py-1 text-sm"
              >
                {" "}
                <span>{categoryId}</span>{" "}
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(categoryId)}
                  className="font-bold text-shop-dark-green"
                >
                  {" "}
                  ×{" "}
                </button>{" "}
              </div>
            ))}{" "}
          </div>
        )}{" "}
      </div>{" "}
      <div>
        {" "}
        <label className="block font-medium">Product Image</label>{" "}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mt-1 w-full rounded-md border p-3"
        />{" "}
        {imageLoading && (
          <p className="mt-2 text-sm text-lightColor"> Uploading image... </p>
        )}{" "}
        {imageFile && !imageLoading && (
          <p className="mt-2 text-sm text-shop-dark-green">
            {" "}
            {imageFile.name}{" "}
          </p>
        )}{" "}
      </div>{" "}
      <div>
        {" "}
        <label className="block font-medium">Status</label>{" "}
        <select
          value={status ?? ""}
          onChange={(event) =>
            setStatus(event.target.value as Product["status"])
          }
          className="mt-1 w-full rounded-md border p-3"
        >
          {" "}
          <option value="">Select status</option>{" "}
          <option value="new">New</option> <option value="hot">Hot</option>{" "}
          <option value="sale">Sale</option>{" "}
          <option value="available">Available</option>{" "}
        </select>{" "}
      </div>{" "}
      <div>
        {" "}
        <label className="block font-medium">Product Type</label>{" "}
        <select
          value={variant ?? ""}
          onChange={(event) =>
            setVariant(event.target.value as Product["variant"])
          }
          className="mt-1 w-full rounded-md border p-3"
        >
          {" "}
          <option value="">Select product type</option>{" "}
          <option value="gadget">Gadget</option>{" "}
          <option value="appliances">Appliances</option>{" "}
          <option value="refrigerator">Refrigerator</option>{" "}
          <option value="others">Others</option>{" "}
          <option value="food & beverages"> Food & Beverages </option>{" "}
        </select>{" "}
      </div>{" "}
      <label className="flex items-center gap-2">
        {" "}
        <input
          type="checkbox"
          checked={isNew}
          onChange={(event) => setIsNew(event.target.checked)}
        />{" "}
        New Product{" "}
      </label>{" "}
      <label className="flex items-center gap-2">
        {" "}
        <input
          type="checkbox"
          checked={isfeatured}
          onChange={(event) => setIsfeatured(event.target.checked)}
        />{" "}
        Featured Product{" "}
      </label>{" "}
      <button
        type="submit"
        className="rounded-md bg-shop-light-green px-5 py-3 font-semibold text-white hover:bg-shop-dark-green hoverEffect"
      >
        {" "}
        Create Product{" "}
      </button>{" "}
    </form>
  );
};
export default VendorCreateProductForm;
