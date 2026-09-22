"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { Tag, Plus, Trash2, Package } from "lucide-react";
import { createAdminBrand, deleteAdminBrand } from "@/actions/adminTaxonomyActions";
import { urlFor } from "@/sanity/lib/image";

interface BrandItem {
  _id: string;
  title: string;
  slug?: { current?: string };
  image?: any;
  productCount: number;
}

interface BrandManagerProps {
  initialBrands: BrandItem[];
}

const BrandManager: React.FC<BrandManagerProps> = ({ initialBrands }) => {
  const [brands, setBrands] = useState(initialBrands);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filtered = brands.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setError(null);
    startTransition(async () => {
      try {
        const res = await createAdminBrand(title);
        if (res.brand) {
          setBrands((prev) => [
            ...prev,
            { ...res.brand, productCount: 0 },
          ]);
          setTitle("");
          setShowAdd(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create brand");
      }
    });
  };

  const handleDelete = (id: string, brandTitle: string) => {
    if (!confirm(`Delete brand "${brandTitle}"? Products associated will lose their brand tag.`)) return;

    startTransition(async () => {
      try {
        await deleteAdminBrand(id);
        setBrands((prev) => prev.filter((b) => b._id !== id));
      } catch (err) {
        alert("Failed to delete brand: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter brands by name..."
          className="w-full sm:max-w-xs rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-hidden"
        />

        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-shop-dark-green px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-shop-light-green transition w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          {showAdd ? "Close Form" : "New Brand"}
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3 animate-in fade-in max-w-md"
        >
          <h4 className="font-semibold text-slate-900 text-sm">Add New Marketplace Brand</h4>
          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <div>
            <label className="block text-xs font-medium text-slate-700">Brand Name *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Apple, Samsung, Sony"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-shop-dark-green px-4 py-1.5 text-xs font-semibold text-white hover:bg-shop-light-green transition disabled:opacity-50"
            >
              {isPending ? "Adding..." : "Save Brand"}
            </button>
          </div>
        </form>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
          No brands found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((brand) => {
            const logoUrl =
              brand.image && brand.image.asset
                ? urlFor(brand.image).width(80).height(80).url()
                : null;

            return (
              <div
                key={brand._id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                      {logoUrl ? (
                        <Image src={logoUrl} alt={brand.title} fill className="object-cover" />
                      ) : (
                        <Tag className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm truncate max-w-[120px]">
                        {brand.title}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {brand.productCount} item{brand.productCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(brand._id, brand.title)}
                    disabled={isPending}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                    title="Delete brand"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BrandManager;
