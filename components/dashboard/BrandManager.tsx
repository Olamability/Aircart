"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { Tag, Plus, Trash2, Package, Pencil, Eye, EyeOff, X, Check } from "lucide-react";
import {
  createBrand,
  updateBrand,
  deleteAdminBrand,
  toggleBrandVisibility,
} from "@/actions/adminTaxonomyActions";
import { urlFor } from "@/sanity/lib/image";

interface BrandItem {
  _id: string;
  title: string;
  slug?: { current?: string };
  image?: any;
  productCount: number;
  hidden?: boolean;
}

interface BrandManagerProps {
  initialBrands: BrandItem[];
}

const BrandManager: React.FC<BrandManagerProps> = ({ initialBrands }) => {
  const [brands, setBrands] = useState(initialBrands);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
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
        const res = await createBrand(title);
        if (res.brand) {
          setBrands((prev) => [
            ...prev,
            { ...res.brand, productCount: 0, hidden: false },
          ]);
          setTitle("");
          setShowAdd(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create brand");
      }
    });
  };

  const startEdit = (brand: BrandItem) => {
    setEditingId(brand._id);
    setEditTitle(brand.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleSaveEdit = (id: string) => {
    if (!editTitle.trim()) return;

    startTransition(async () => {
      try {
        await updateBrand(id, { title: editTitle.trim() });
        setBrands((prev) =>
          prev.map((b) => (b._id === id ? { ...b, title: editTitle.trim() } : b))
        );
        cancelEdit();
      } catch (err) {
        alert("Failed to update brand: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    });
  };

  const handleToggleVisibility = (id: string, currentHidden?: boolean) => {
    const nextHidden = !currentHidden;
    startTransition(async () => {
      try {
        await toggleBrandVisibility(id, nextHidden);
        setBrands((prev) =>
          prev.map((b) => (b._id === id ? { ...b, hidden: nextHidden } : b))
        );
      } catch (err) {
        alert("Failed to toggle brand visibility: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    });
  };

  const handleDelete = (id: string, brandTitle: string, count: number) => {
    if (count > 0) {
      const confirmForce = confirm(
        `Warning: Brand "${brandTitle}" is assigned to ${count} product(s)!\n\nDeleting it will remove the brand association from those products. Do you want to proceed?`
      );
      if (!confirmForce) return;

      startTransition(async () => {
        try {
          await deleteAdminBrand(id, true);
          setBrands((prev) => prev.filter((b) => b._id !== id));
        } catch (err) {
          alert("Failed to delete brand: " + (err instanceof Error ? err.message : "Unknown error"));
        }
      });
      return;
    }

    if (!confirm(`Delete brand "${brandTitle}"? This cannot be undone.`)) return;

    startTransition(async () => {
      try {
        await deleteAdminBrand(id, false);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((brand) => {
            const logoUrl =
              brand.image && brand.image.asset
                ? urlFor(brand.image).width(80).height(80).url()
                : null;
            const isEditing = editingId === brand._id;

            return (
              <div
                key={brand._id}
                className={`rounded-xl border bg-white p-4 shadow-xs flex flex-col justify-between transition ${
                  brand.hidden ? "border-amber-200 bg-amber-50/20" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">Brand Name</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-hidden"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        <X className="h-3 w-3" /> Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(brand._id)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 rounded-md bg-shop-dark-green px-2.5 py-1 text-xs font-semibold text-white hover:bg-shop-light-green disabled:opacity-50"
                      >
                        <Check className="h-3 w-3" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
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
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-semibold text-slate-900 text-sm truncate max-w-[120px]">
                            {brand.title}
                          </h4>
                          {brand.hidden && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-800">
                              Hidden
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {brand.productCount} item{brand.productCount === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(brand._id, brand.hidden)}
                        disabled={isPending}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded transition"
                        title={brand.hidden ? "Unhide brand" : "Hide brand"}
                      >
                        {brand.hidden ? (
                          <EyeOff className="h-4 w-4 text-amber-600" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(brand)}
                        disabled={isPending}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded transition"
                        title="Edit brand"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(brand._id, brand.title, brand.productCount)}
                        disabled={isPending}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                        title={
                          brand.productCount > 0
                            ? `Cannot safely delete: ${brand.productCount} product(s) attached`
                            : "Delete brand"
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BrandManager;
