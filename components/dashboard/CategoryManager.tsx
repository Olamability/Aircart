"use client";

import React, { useState, useTransition } from "react";
import { FolderTree, Plus, Trash2, Package, Pencil, Eye, EyeOff, X, Check, AlertTriangle } from "lucide-react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryVisibility,
} from "@/actions/adminTaxonomyActions";

interface CategoryItem {
  _id: string;
  title: string;
  slug?: { current?: string };
  description?: string;
  productCount: number;
  hidden?: boolean;
}

interface CategoryManagerProps {
  initialCategories: CategoryItem[];
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ initialCategories }) => {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filtered = categories.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setError(null);
    startTransition(async () => {
      try {
        const res = await createCategory(title, description);
        if (res.category) {
          setCategories((prev) => [
            ...prev,
            { ...res.category, productCount: 0, hidden: false },
          ]);
          setTitle("");
          setDescription("");
          setShowAdd(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create category");
      }
    });
  };

  const startEdit = (cat: CategoryItem) => {
    setEditingId(cat._id);
    setEditTitle(cat.title);
    setEditDescription(cat.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  };

  const handleSaveEdit = (id: string) => {
    if (!editTitle.trim()) return;

    startTransition(async () => {
      try {
        await updateCategory(id, {
          title: editTitle,
          description: editDescription,
        });
        setCategories((prev) =>
          prev.map((c) =>
            c._id === id
              ? { ...c, title: editTitle.trim(), description: editDescription.trim() }
              : c
          )
        );
        cancelEdit();
      } catch (err) {
        alert("Failed to update category: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    });
  };

  const handleToggleVisibility = (id: string, currentHidden?: boolean) => {
    const nextHidden = !currentHidden;
    startTransition(async () => {
      try {
        await toggleCategoryVisibility(id, nextHidden);
        setCategories((prev) =>
          prev.map((c) => (c._id === id ? { ...c, hidden: nextHidden } : c))
        );
      } catch (err) {
        alert("Failed to update visibility: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    });
  };

  const handleDelete = (id: string, catTitle: string, count: number) => {
    if (count > 0) {
      const confirmForce = confirm(
        `Warning: Category "${catTitle}" has ${count} product(s) assigned to it!\n\nAre you sure you want to force delete it? Products will lose their category association.`
      );
      if (!confirmForce) return;

      startTransition(async () => {
        try {
          await deleteCategory(id, true);
          setCategories((prev) => prev.filter((c) => c._id !== id));
        } catch (err) {
          alert("Failed to delete category: " + (err instanceof Error ? err.message : "Unknown error"));
        }
      });
      return;
    }

    if (!confirm(`Delete category "${catTitle}"? This cannot be undone.`)) return;

    startTransition(async () => {
      try {
        await deleteCategory(id, false);
        setCategories((prev) => prev.filter((c) => c._id !== id));
      } catch (err) {
        alert("Failed to delete category: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter categories by name..."
          className="w-full sm:max-w-xs rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-hidden"
        />

        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-shop-dark-green px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-shop-light-green transition w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          {showAdd ? "Close Form" : "New Category"}
        </button>
      </div>

      {/* Inline Create Form */}
      {showAdd && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-4 animate-in fade-in"
        >
          <h4 className="font-semibold text-slate-900 text-sm">Create New Category</h4>
          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700">Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Consumer Electronics"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of items in this category"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
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
              {isPending ? "Creating..." : "Save Category"}
            </button>
          </div>
        </form>
      )}

      {/* Grid of Categories */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
          No categories found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cat) => {
            const isEditing = editingId === cat._id;

            return (
              <div
                key={cat._id}
                className={`rounded-xl border bg-white p-4 shadow-xs flex flex-col justify-between transition ${
                  cat.hidden ? "border-amber-200 bg-amber-50/20" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">Description</label>
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
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
                        onClick={() => handleSaveEdit(cat._id)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 rounded-md bg-shop-dark-green px-2.5 py-1 text-xs font-semibold text-white hover:bg-shop-light-green disabled:opacity-50"
                      >
                        <Check className="h-3 w-3" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2.5 rounded-lg shrink-0 ${
                            cat.hidden
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-50 text-shop-dark-green"
                          }`}
                        >
                          <FolderTree className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-semibold text-slate-900 text-sm">{cat.title}</h4>
                            {cat.hidden && (
                              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                                Hidden
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {cat.description || "Marketplace category"}
                          </p>
                          <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            <Package className="h-3 w-3" />
                            {cat.productCount} product{cat.productCount === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(cat._id, cat.hidden)}
                          disabled={isPending}
                          className="text-slate-400 hover:text-slate-700 p-1 rounded transition"
                          title={cat.hidden ? "Unhide from storefront" : "Hide from storefront"}
                        >
                          {cat.hidden ? (
                            <EyeOff className="h-4 w-4 text-amber-600" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(cat)}
                          disabled={isPending}
                          className="text-slate-400 hover:text-slate-700 p-1 rounded transition"
                          title="Edit category"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat._id, cat.title, cat.productCount)}
                          disabled={isPending}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                          title={
                            cat.productCount > 0
                              ? `Cannot safely delete: ${cat.productCount} product(s) attached`
                              : "Delete category"
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
