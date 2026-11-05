
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, Star, XCircle } from "lucide-react";

import {
    submitProductReview,
    type EligibleReviewOrder,
    type CustomerProductReview,
} from "@/actions/productReviews";

interface ProductReviewFormProps {
    productId: string;
    productTitle: string;
    eligibleOrders: EligibleReviewOrder[];
    customerReview: CustomerProductReview | null;
    isSignedIn: boolean;
}

export default function ProductReviewForm({
    productId,
    productTitle,
    eligibleOrders,
    customerReview,
    isSignedIn,
}: ProductReviewFormProps) {
    const router = useRouter();

    const [orderId, setOrderId] = useState(
        eligibleOrders[0]?._id ?? "",
    );
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!orderId) {
            setMessage("Please select an eligible order.");
            return;
        }

        if (rating < 1 || rating > 5) {
            setMessage("Please select a star rating.");
            return;
        }

        setIsSubmitting(true);
        setMessage("");

        try {
            const result = await submitProductReview({
                orderId,
                productId,
                rating,
                comment: comment.trim(),
            });

            if (result.success) {
                setIsSuccess(true);
                setMessage(
                    result.message ||
                    "Your review has been submitted for approval.",
                );

                setRating(0);
                setComment("");

                router.refresh();
            } else {
                setMessage(
                    result.message || "Unable to submit your review.",
                );
            }
        } catch (error) {
            console.error("Review submission error:", error);
            setMessage(
                "Something went wrong while submitting your review. Please try again.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isSignedIn) {
        return (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-sm text-gray-600">
                    Please sign in to share your experience with this product.
                </p>

                <Link
                    href="/sign-in"
                    className="mt-3 inline-flex rounded-lg bg-[#063C28] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#052f20]"
                >
                    Sign In to Review
                </Link>
            </div>
        );
    }

    // A review already exists and is awaiting admin approval.
    if (customerReview?.status === "pending") {
        return (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />

                    <div>
                        <h3 className="font-semibold text-gray-900">
                            Your review is awaiting approval
                        </h3>

                        <p className="mt-1 text-sm text-gray-600">
                            Thank you for reviewing {productTitle}. Your
                            review has been received and is waiting for
                            admin approval. Once approved, it will appear
                            publicly on this product page.
                        </p>

                        <div className="mt-3 flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Star
                                    key={index}
                                    className={`h-4 w-4 ${index < customerReview.rating
                                            ? "fill-[#F28C28] text-[#F28C28]"
                                            : "text-gray-300"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // The admin has approved the customer's review.
    if (customerReview?.status === "approved") {
        return (
            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-600" />

                    <div>
                        <h3 className="font-semibold text-gray-900">
                            Your review has been published!
                        </h3>

                        <p className="mt-1 text-sm text-gray-600">
                            Thank you for sharing your experience.
                            Your review has been approved and is now
                            visible to other customers.
                        </p>

                        <div className="mt-3 flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Star
                                    key={index}
                                    className={`h-4 w-4 ${index < customerReview.rating
                                            ? "fill-[#F28C28] text-[#F28C28]"
                                            : "text-gray-300"
                                        }`}
                                />
                            ))}
                        </div>

                        {customerReview.comment && (
                            <p className="mt-3 rounded-lg bg-white/70 p-3 text-sm text-gray-700">
                                “{customerReview.comment}”
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // The admin has rejected the customer's review.
    if (customerReview?.status === "rejected") {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />

                    <div>
                        <h3 className="font-semibold text-gray-900">
                            Your review was not approved
                        </h3>

                        <p className="mt-1 text-sm text-gray-600">
                            Unfortunately, your review did not meet our
                            review guidelines and was not published.
                            Please contact our support team if you need
                            further clarification.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Immediate feedback after successful submission.
    if (isSuccess) {
        return (
            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-600" />

                    <div>
                        <h3 className="font-semibold text-gray-900">
                            Review submitted successfully!
                        </h3>

                        <p className="mt-1 text-sm text-gray-600">
                            Thank you for sharing your experience.
                            Your review has been received and is awaiting
                            admin approval. Once approved, it will appear
                            publicly on this product page.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // No previous review, but the customer has an eligible order.
    if (eligibleOrders.length > 0) {
        return (
            <form onSubmit={handleSubmit} className="space-y-5">
                {eligibleOrders.length > 1 && (
                    <div>
                        <label
                            htmlFor="review-order"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Select the order you purchased this product with
                        </label>

                        <select
                            id="review-order"
                            value={orderId}
                            onChange={(event) => setOrderId(event.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#063C28] focus:ring-1 focus:ring-[#063C28]"
                        >
                            {eligibleOrders.map((order) => (
                                <option key={order._id} value={order._id}>
                                    Order #{order.orderNumber}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700">
                        Your Rating
                    </label>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: 5 }).map((_, index) => {
                            const starValue = index + 1;
                            const activeRating = hoveredRating || rating;

                            return (
                                <button
                                    key={starValue}
                                    type="button"
                                    onClick={() => setRating(starValue)}
                                    onMouseEnter={() =>
                                        setHoveredRating(starValue)
                                    }
                                    onMouseLeave={() => setHoveredRating(0)}
                                    aria-label={`Rate ${starValue} out of 5 stars`}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`h-8 w-8 ${starValue <= activeRating
                                                ? "fill-[#F28C28] text-[#F28C28]"
                                                : "text-gray-300"
                                            }`}
                                    />
                                </button>
                            );
                        })}
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                        {rating > 0
                            ? `${rating} out of 5 stars`
                            : "Select a rating"}
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="review-comment"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Your Experience (Optional)
                    </label>

                    <textarea
                        id="review-comment"
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        maxLength={1000}
                        rows={4}
                        placeholder="Tell other customers about your experience with this product..."
                        className="w-full resize-y rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#063C28] focus:ring-1 focus:ring-[#063C28]"
                    />

                    <p className="mt-1 text-right text-xs text-gray-400">
                        {comment.length}/1000
                    </p>
                </div>

                {message && (
                    <p className="text-sm text-red-600">
                        {message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting || rating === 0 || !orderId}
                    className="w-full rounded-lg bg-[#063C28] px-5 py-3 font-medium text-white transition hover:bg-[#052f20] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting ? "Submitting Review..." : "Submit Review"}
                </button>

                <p className="text-xs text-gray-500">
                    Your review will be checked by our team before it
                    becomes publicly visible.
                </p>
            </form>
        );
    }

    // Customer has not purchased and received this product.
    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-sm text-gray-600">
                You don&apos;t have an eligible order to review this product
                yet. Reviews are available after your order has been paid
                for and delivered.
            </p>
        </div>
    );
}
