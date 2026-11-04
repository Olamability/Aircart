"use client";

import React, { useState, useTransition } from "react";
import { Check, Loader2, Minus, Plus } from "lucide-react";
import { adjustProductStockAction } from "@/actions/adminProductActions";

interface StockAdjustInputProps {
  productId: string;
  currentStock: number;
  productTitle: string;
}

export const StockAdjustInput: React.FC<StockAdjustInputProps> = ({
  productId,
  currentStock,
  productTitle,
}) => {
  const [stock, setStock] = useState(currentStock);
  const [inputVal, setInputVal] = useState(String(currentStock));
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleUpdate = (newStock: number) => {
    if (newStock < 0) return;

    startTransition(async () => {
      try {
        await adjustProductStockAction(productId, newStock, `Admin adjusted stock to ${newStock}`);
        setStock(newStock);
        setInputVal(String(newStock));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        alert("Failed to update stock: " + (err instanceof Error ? err.message : "Unknown error"));
        setInputVal(String(stock));
      }
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={isPending || stock <= 0}
        onClick={() => handleUpdate(stock - 1)}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
        title="Decrease stock by 1"
      >
        <Minus className="h-3 w-3" />
      </button>

      <input
        type="number"
        min="0"
        value={inputVal}
        disabled={isPending}
        onChange={(e) => setInputVal(e.target.value)}
        onBlur={() => {
          const parsed = parseInt(inputVal, 10);
          if (!isNaN(parsed) && parsed >= 0 && parsed !== stock) {
            handleUpdate(parsed);
          } else {
            setInputVal(String(stock));
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const parsed = parseInt(inputVal, 10);
            if (!isNaN(parsed) && parsed >= 0 && parsed !== stock) {
              handleUpdate(parsed);
            }
          }
        }}
        className="h-7 w-16 rounded-md border border-slate-300 bg-white px-2 text-center text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-hidden disabled:opacity-50 font-mono"
      />

      <button
        type="button"
        disabled={isPending}
        onClick={() => handleUpdate(stock + 1)}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
        title="Increase stock by 1"
      >
        <Plus className="h-3 w-3" />
      </button>

      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
      ) : saved ? (
        <Check className="h-3.5 w-3.5 text-emerald-600 animate-in fade-in" />
      ) : null}
    </div>
  );
};

