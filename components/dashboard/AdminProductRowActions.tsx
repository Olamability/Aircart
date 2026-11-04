"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { Edit2, ExternalLink, Trash2, Eye, EyeOff } from "lucide-react";
import {
  deleteAdminProduct,
  toggleProductPublishAction,
} from "@/actions/adminProductActions";

interface AdminProductRowActionsProps {
  productId: string;
  productSlug?: string;
  productTitle: string;
  currentStatus?: string;
}

const AdminProductRowActions: React.FC<AdminProductRowActionsProps> = ({
  productId,
  productSlug,
  productTitle,
  currentStatus,
}) => {
  const [isPending, startTransition] = useTransition();

  const isPublished = currentStatus !== "draft";

  const handleTogglePublish = () => {
    startTransition(async () => {
      try {
        await toggleProductPublishAction(productId, !isPublished);
      } catch (err) {
        alert(
          "Failed to update publishing status: " +
            (err instanceof Error ? err.message : "Unknown error")
        );
      }
    });
  };

  const handleDelete = () => {
    if (
      !confirm(
        `Are you sure you want to delete "${productTitle}"? This cannot be undone.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await deleteAdminProduct(productId);
      } catch (err) {
        alert(
          "Failed to delete product: " +
            (err instanceof Error ? err.message : "Unknown error")
        );
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      {/* Quick toggle publish / unpublish */}
      <button
        type="button"
        onClick={handleTogglePublish}
        disabled={isPending}
        title={isPublished ? "Unpublish Product (Draft)" : "Publish Product"}
        className={`rounded-lg p-1.5 transition disabled:opacity-50 ${
          isPublished
            ? "text-emerald-600 hover:bg-emerald-50"
            : "text-amber-600 hover:bg-amber-50"
        }`}
      >
        {isPublished ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </button>

      {productSlug && (
        <Link
          href={`/product/${productSlug}`}
          target="_blank"
          title="View on Storefront"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      )}

      <Link
        href={`/admin/products/${productId}/edit`}
        title="Edit Product"
        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
      >
        <Edit2 className="h-4 w-4" />
      </Link>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        title="Delete Product"
        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default AdminProductRowActions;
