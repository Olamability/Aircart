"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import type { Product } from "@/sanity.types";
import type { VendorProductWithBrand } from "@/lib/vendorProduct";
import { uploadVendorProductImage } from "@/actions/uploadVendorProductImage";
import { searchBrands } from "@/actions/searchBrands";
import { searchCategories } from "@/actions/searchCategories";
interface VendorProductFormProps {
  product: VendorProductWithBrand;
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
    imageAssetId?: string;
    brandId?: string;
    categoryIds: string[];
  }) => Promise<void>;
}
const VendorProductForm: React.FC<VendorProductFormProps> = ({
  product,
  onSubmit,
}) => {
  const router = useRouter();
  const [title, setTitle] = useState(product.title ?? "");
  const [description, setDescription] = useState(product.description ?? "");
  const [price, setPrice] = useState(product.price ?? 0);
  const [discount, setDiscount] = useState(product.discount ?? 0);
  const [stock, setStock] = useState(product.stock ?? 0);
  const [status, setStatus] = useState<Product["status"]>(product.status);
  const [isNew, setIsNew] = useState(product.isNew ?? false);
  const [variant, setVariant] = useState<Product["variant"]>(product.variant);
  const [isfeatured, setIsfeatured] = useState(product.isfeatured ?? false);
  const [brandSearch, setBrandSearch] = useState(product.brand?.title ?? "");
  const [brandId, setBrandId] = useState<string>(product.brand?._id ?? "");
  const [brands, setBrands] = useState<{ _id: string; title: string }[]>([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>(
    product.categories?.map((category) => category._id) ?? [],
  );
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
  const handleSelectBrand = (brand: { _id: string; title: string }) => {
    setBrandId(brand._id);
    setBrandSearch(brand.title);
    setBrands([]);
  };
  const handleSelectCategory = (category: { _id: string; title: string }) => {
    setCategoryIds((prev) => [...prev, category._id]);
    setCategorySearch("");
    setCategories([]);
  };
  const handleRemoveCategory = (categoryId: string) => {
    setCategoryIds((prev) => prev.filter((id) => id !== categoryId));
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
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading product image:", error);
      setImageFile(null);
      setImageAssetId(undefined);
      toast.error(
        error instanceof Error ? error.message : "Unable to upload image",
      );
    } finally {
      setImageLoading(false);
    }
  };
  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!categoryIds.length) {
      toast.error("Please select at least one category");
      return;
    }
    try {
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
        imageAssetId,
        brandId: brandId || undefined,
        categoryIds,
      });
      toast.success("Product updated successfully");
      setTimeout(() => {
        router.push("/vendor/products");
      }, 800);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(
        error instanceof Error ? error.message : "Unable to update product",
      );
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
            setBrandId("");
            setBrands([]);
          }}
          placeholder="Search brand"
          className="mt-1 w-full rounded-md border p-3"
        />{" "}
        {brandLoading && (
          <p className="mt-2 text-sm text-lightColor"> Searching brands... </p>
        )}{" "}
        {!brandLoading && brands.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-md">
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
          </div>
        )}{" "}
        {brandId && (
          <p className="mt-2 text-sm text-shop-dark-green">
            {" "}
            Selected brand: {brandSearch}{" "}
          </p>
        )}{" "}
      </div>{" "}
      <div className="relative">
        {" "}
        <label className="block font-medium">
          {" "}
          Category <span className="text-red-600">*</span>{" "}
        </label>{" "}
        <input
          type="text"
          value={categorySearch}
          onChange={(event) => {
            setCategorySearch(event.target.value);
            setCategories([]);
          }}
          placeholder="Search category"
          className="mt-1 w-full rounded-md border p-3"
        />{" "}
        {categoryLoading && (
          <p className="mt-2 text-sm text-lightColor">
            {" "}
            Searching categories...{" "}
          </p>
        )}{" "}
        {!categoryLoading && categories.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-md">
            {" "}
            {categories
              .filter((category) => !categoryIds.includes(category._id))
              .map((category) => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => handleSelectCategory(category)}
                  className="block w-full px-3 py-2 text-left hover:bg-shop-light-green/10"
                >
                  {" "}
                  {category.title}{" "}
                </button>
              ))}{" "}
          </div>
        )}{" "}
        {categoryIds.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {" "}
            {categoryIds.map((categoryId) => (
              <div
                key={categoryId}
                className="flex items-center gap-2 rounded-md bg-shop-light-green/10 px-3 py-2 text-sm"
              >
                {" "}
                <span>{categoryId}</span>{" "}
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(categoryId)}
                  className="font-semibold text-red-600"
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
          <option value="food & beverages">Food & Beverages</option>{" "}
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
        Save Changes{" "}
      </button>{" "}
    </form>
  );
};
export default VendorProductForm;
