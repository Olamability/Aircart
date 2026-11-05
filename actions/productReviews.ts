
"use server";

import { createHash } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { backendClient } from "@/sanity/lib/backendClient";

interface SubmitReviewInput {
    orderId: string;
    productId: string;
    rating: number;
    comment?: string;
}

interface ReviewSummary {
    averageRating: number;
    reviewCount: number;
}

export interface ProductReview {
    _id: string;
    customerName: string;
    rating: number;
    comment?: string;
    createdAt: string;
}

export interface EligibleReviewOrder {
    _id: string;
    orderNumber?: string;
    createdAt?: string;
}

interface EligibleReviewOrderResult extends EligibleReviewOrder {
    existingReview?: string;
}

export interface CustomerProductReview {
    _id: string;
    status: "pending" | "approved" | "rejected";
    rating: number;
    comment?: string;
    createdAt: string;
}

const isValidId = (value: unknown): value is string =>
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= 128 &&
    !value.startsWith("drafts.");

const getReviewDocumentId = (orderId: string, productId: string) => {
    const hash = createHash("sha256")
        .update(`${orderId}:${productId}`)
        .digest("hex");

    return `review-${hash}`;
};

/**
 * Submit a verified product review.
 * Only customers with paid and delivered orders are eligible.
 */
export async function submitProductReview(input: SubmitReviewInput) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return {
                success: false,
                message: "Please sign in to submit a review.",
            };
        }

        if (
            !input ||
            !isValidId(input.orderId) ||
            !isValidId(input.productId)
        ) {
            return {
                success: false,
                message: "Invalid order or product.",
            };
        }

        if (
            !Number.isInteger(input.rating) ||
            input.rating < 1 ||
            input.rating > 5
        ) {
            return {
                success: false,
                message: "Rating must be between 1 and 5 stars.",
            };
        }

        const comment =
            typeof input.comment === "string"
                ? input.comment.trim()
                : "";

        if (comment.length > 1000) {
            return {
                success: false,
                message: "Your review cannot exceed 1000 characters.",
            };
        }

        // Retrieve the order using the authenticated Clerk user ID.
        const order = await backendClient.fetch(
            `*[
                _type == "order" &&
                _id == $orderId &&
                clerkUserId == $userId
            ][0] {
                _id,
                clerkUserId,
                customerName,
                paymentStatus,
                status,
                products[] {
                    "productId": product._ref
                }
            }`,
            {
                orderId: input.orderId,
                userId,
            },
        );

        if (!order) {
            return {
                success: false,
                message:
                    "Order not found or you are not authorized to review it.",
            };
        }

        if (order.paymentStatus !== "paid") {
            return {
                success: false,
                message: "Only paid orders are eligible for reviews.",
            };
        }

        if (order.status !== "delivered") {
            return {
                success: false,
                message: "You can review this product after delivery.",
            };
        }

        const purchasedProduct = order.products?.some(
            (item: { productId?: string }) =>
                item.productId === input.productId,
        );

        if (!purchasedProduct) {
            return {
                success: false,
                message:
                    "This product does not belong to the selected order.",
            };
        }

        // Prevent duplicate reviews for the same order and product.
        const existingReview = await backendClient.fetch(
            `*[
                _type == "review" &&
                order._ref == $orderId &&
                product._ref == $productId
            ][0]._id`,
            {
                orderId: input.orderId,
                productId: input.productId,
            },
        );

        if (existingReview) {
            return {
                success: false,
                message:
                    "You have already reviewed this product for this order.",
            };
        }

        const customerName =
            typeof order.customerName === "string" &&
                order.customerName.trim()
                ? order.customerName.trim()
                : "Verified customer";

        // Deterministic ID protects against duplicate document creation.
        const reviewId = getReviewDocumentId(
            input.orderId,
            input.productId,
        );

        await backendClient.createIfNotExists({
            _id: reviewId,
            _type: "review",

            product: {
                _type: "reference",
                _ref: input.productId,
            },

            order: {
                _type: "reference",
                _ref: input.orderId,
            },

            clerkUserId: userId,
            customerName,
            rating: input.rating,
            comment,
            status: "pending",
            createdAt: new Date().toISOString(),
        });

        return {
            success: true,
            message: "Your review has been submitted for approval.",
        };
    } catch (error) {
        console.error("Error submitting product review:", error);

        return {
            success: false,
            message: "Unable to submit your review. Please try again.",
        };
    }
}

/**
 * Retrieve the average rating and approved review count.
 */
export async function getProductReviewSummary(
    productId: string,
): Promise<ReviewSummary> {
    try {
        if (!isValidId(productId)) {
            return {
                averageRating: 0,
                reviewCount: 0,
            };
        }

        const summary = await backendClient.fetch<{
            averageRating: number | null;
            reviewCount: number;
        }>(
            `{
                "reviewCount": count(*[
                    _type == "review" &&
                    product._ref == $productId &&
                    status == "approved"
                ]),
                "averageRating": math::avg(*[
                    _type == "review" &&
                    product._ref == $productId &&
                    status == "approved"
                ].rating)
            }`,
            { productId },
        );

        return {
            averageRating: Number(
                (summary?.averageRating ?? 0).toFixed(1),
            ),
            reviewCount: summary?.reviewCount ?? 0,
        };
    } catch (error) {
        console.error("Error fetching product review summary:", error);

        return {
            averageRating: 0,
            reviewCount: 0,
        };
    }
}

/**
 * Retrieve publicly visible approved reviews.
 */
export async function getProductReviews(
    productId: string,
): Promise<ProductReview[]> {
    try {
        if (!isValidId(productId)) {
            return [];
        }

        const reviews = await backendClient.fetch<ProductReview[]>(
            `*[
                _type == "review" &&
                product._ref == $productId &&
                status == "approved"
            ] | order(createdAt desc)[0...50] {
                _id,
                customerName,
                rating,
                comment,
                createdAt
            }`,
            { productId },
        );

        return reviews ?? [];
    } catch (error) {
        console.error("Error fetching product reviews:", error);
        return [];
    }
}

/**
 * Retrieve eligible orders for reviewing a particular product.
 *
 * Only the authenticated customer's paid and delivered orders qualify.
 * Orders that already have a review for this product are excluded.
 */
export async function getEligibleProductReviewOrders(
    productId: string,
): Promise<EligibleReviewOrder[]> {
    try {
        const { userId } = await auth();

        if (!userId || !isValidId(productId)) {
            return [];
        }

        const orders =
            await backendClient.fetch<EligibleReviewOrderResult[]>(
                `*[
                    _type == "order" &&
                    clerkUserId == $userId &&
                    paymentStatus == "paid" &&
                    status == "delivered" &&
                    count(products[product._ref == $productId]) > 0
                ] | order(_createdAt desc) {
                    _id,
                    orderNumber,
                    "createdAt": _createdAt,
                    "existingReview": *[
                        _type == "review" &&
                        order._ref == ^._id &&
                        product._ref == $productId
                    ][0]._id
                }`,
                {
                    userId,
                    productId,
                },
            );

        return (orders ?? [])
            .filter((order) => !order.existingReview)
            .map(({ _id, orderNumber, createdAt }) => ({
                _id,
                orderNumber,
                createdAt,
            }));
    } catch (error) {
        console.error(
            "Error fetching eligible product review orders:",
            error,
        );

        return [];
    }
}

/**
 * Retrieve the authenticated customer's existing review
 * for a particular product, regardless of approval status.
 */
export async function getCustomerProductReview(
    productId: string,
): Promise<CustomerProductReview | null> {
    try {
        const { userId } = await auth();

        if (!userId || !isValidId(productId)) {
            return null;
        }

        const review = await backendClient.fetch<CustomerProductReview | null>(
            `*[
                _type == "review" &&
                clerkUserId == $userId &&
                product._ref == $productId
            ] | order(createdAt desc)[0] {
                _id,
                status,
                rating,
                comment,
                createdAt
            }`,
            {
                userId,
                productId,
            },
        );

        return review ?? null;
    } catch (error) {
        console.error(
            "Error fetching customer's product review:",
            error,
        );

        return null;
    }
}
