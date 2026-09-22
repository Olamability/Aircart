"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, Check, Edit2 } from "lucide-react";
import { updateVendorStock } from "@/actions/vendorInventoryActions";
import { urlFor } from "@/sanity/lib/image";
import StatusBadge from "@/components/dashboard/StatusBadge";

interface InventoryProduct {
  _id: string;
  title: string;
  price: number;
  stock: number;
  status?: string;
  image?: any;
  categories?: Array<{ _id: string; title: string }>;
}

interface VendorInventoryTableProps {
  products: InventoryProduct[];
}

const VendorInventoryTable: React.FC<VendorInventoryTableProps> = ({ products }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [isPending, startTransition] = useTransition();

  const handleStartEdit = (product: InventoryProduct) => {
    setEditingId(product._id);
    setEditStock(product.stock);
  };

  const handleSaveStock = (productId: string) => {
    startTransition(async () => {
      try {
        await updateVendorStock(productId, Number(editStock));
        setEditingId(null);
      } catch (err) {
        alert("Failed to update stock: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Product</th>
              <th className="px-4 py-3.5">Categories</th>
              <th className="px-4 py-3.5">Unit Price</th>
              <th className="px-4 py-3.5">Current Stock</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Quick Stock Adjustment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              const img =
                product.image && product.image[0]
                  ? urlFor(product.image[0]).width(64).height(64).url()
                  : null;

              const isEditing = editingId === product._id;

              return (
                <tr key={product._id} className="hover:bg-slate-50/75 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden shrink-0">
                        {img ? (
                          <Image src={img} alt={product.title} fill className="object-cover" />
                        ) : (
                          <Package className="h-5 w-5 m-auto text-slate-400" />
                        )}
                      </div>
                      <div className="max-w-[200px]">
                        <span className="font-medium text-slate-900 block truncate">
                          {product.title}
                        </span>
                        <Link
                          href={`/vendor/products/${product._id}/edit`}
                          className="text-xs text-shop-dark-green hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          Full Edit
                        </Link>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-xs text-slate-500">
                    {product.categories?.length
                      ? product.categories.map((c) => c.title).join(", ")
                      : "—"}
                  </td>

                  <td className="px-4 py-4 font-semibold text-slate-900">
                    ₦{product.price?.toLocaleString()}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
                        product.stock === 0
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : product.stock <= 5
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {product.stock === 0 ? "Out of Stock" : `${product.stock} units`}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge status={product.status || "available"} />
                  </td>

                  <td className="px-5 py-4 text-right">
                    {isEditing ? (
                      <div className="inline-flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={editStock}
                          onChange={(e) => setEditStock(Number(e.target.value))}
                          className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveStock(product._id)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 transition disabled:opacity-50"
                        >
                          <Check className="h-3 w-3" /> Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-xs text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(product)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-shop-dark-green hover:underline"
                      >
                        <Edit2 className="h-3 w-3" /> Adjust Stock
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorInventoryTable;
