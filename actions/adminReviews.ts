
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { backendClient } from "@/sanity/lib/backendClient";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type ReviewModerationFilter = ReviewStatus | "all";

export interface AdminProductReview {
    _id: string;
    _rev: string;
    customerName: string;
    clerkUserId: string;
    rating: number;
    comment?: string;
    status: ReviewStatus;
    createdAt: string;
    product: {
        _id: string;
        title: string;
        slug?: string;
    } | null;
    order: {
        _id: string;
        orderNumber?: string;
        status?: string;
        paymentStatus?: string;
    } | null;
}

export interface ReviewModerationResult {
    success: boolean;
    message: string;
    review?: AdminProductReview;
}

/**
 * Retrieve product reviews for the admin moderation dashboard.
 *
 * Requires reviews.view permission.
 */
export async function getAdminProductReviews(
    status: ReviewModerationFilter = "pending",
): Promise<AdminProductReview[]> {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("You must be signed in.");
    }

    await requirePermission(permissions.reviews_view);

    const validStatuses: ReviewModerationFilter[] = [
        "pending",
        "approved",
        "rejected",
        "all",
    ];

    if (!validStatuses.includes(status)) {
        throw new Error("Invalid review filter.");
    }

    const query = `*[
    _type == "review" &&
    ($status == "all" || status == $status)
  ] | order(createdAt desc) {
    _id,
    _rev,
    customerName,
    clerkUserId,
    rating,
    comment,
    status,
    createdAt,
    "product": product->{
      _id,
      title,
      "slug": slug.current
    },
    "order": order->{
      _id,
      orderNumber,
      status,
      paymentStatus
    }
  }`;

    const reviews = await backendClient.fetch<AdminProductReview[]>(
        query,
        { status },
    );

    return reviews;
}

/**
 * Approve or reject a pending product review.
 *
 * Requires reviews.moderate permission.
 * Only pending reviews can be moderated.
 */
export async function moderateProductReview(
    reviewId: string,
    decision: "approved" | "rejected",
): Promise<ReviewModerationResult> {
    const { userId } = await auth();

    if (!userId) {
        return {
            success: false,
            message: "You must be signed in.",
        };
    }

    await requirePermission(permissions.reviews_moderate);

    if (
        typeof reviewId !== "string" ||
        !reviewId.trim() ||
        reviewId.length > 128
    ) {
        return {
            success: false,
            message: "Invalid review ID.",
        };
    }

    if (decision !== "approved" && decision !== "rejected") {
        return {
            success: false,
            message: "Invalid moderation decision.",
        };
    }

    try {
        const review = await backendClient.fetch<{
            _id: string;
            _rev: string;
            _type: string;
            status: ReviewStatus;
            product?: {
                _id: string;
                title?: string;
                slug?: {
                    current?: string;
                };
            };
        } | null>(
            `*[
        _type == "review" &&
        _id == $reviewId
      ][0] {
        _id,
        _rev,
        _type,
        status,
        "product": product->{
          _id,
          title,
          slug
        }
      }`,
            { reviewId },
        );

        if (!review) {
            return {
                success: false,
                message: "Review not found.",
            };
        }

        if (review.status !== "pending") {
            return {
                success: false,
                message: "This review has already been moderated.",
            };
        }

        // Use the revision to prevent overwriting a concurrent moderation action.
        await backendClient
            .patch(review._id)
            .ifRevisionId(review._rev)
            .set({ status: decision })
            .commit();

        // Refresh the moderation dashboard and storefront routes.
        revalidatePath("/admin/reviews");
        revalidatePath("/shop");

        const productSlug = review.product?.slug?.current;

        if (productSlug) {
            revalidatePath(`/product/${productSlug}`);
        }

        return {
            success: true,
            message:
                decision === "approved"
                    ? "Review approved successfully."
                    : "Review rejected successfully.",
        };
    } catch (error) {
        console.error("Error moderating product review:", error);

        return {
            success: false,
            message:
                "Unable to moderate this review. It may have already been updated. Please refresh and try again.",
        };
    }
}
