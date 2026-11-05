
"use client";

import { useState } from "react";
import {
    CheckCircle2,
    XCircle,
    Clock,
    Star,
    MessageSquare,
    RefreshCw,
    Loader2,
    Package,
    User,
    CalendarDays,
    ShieldCheck,
} from "lucide-react";

import {
    getAdminProductReviews,
    moderateProductReview,
    type AdminProductReview,
    type ReviewModerationFilter,
} from "@/actions/adminReviews";

interface AdminReviewsClientProps {
    initialReviews: AdminProductReview[];
}

const filters: {
    label: string;
    value: ReviewModerationFilter;
}[] = [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
        { label: "All Reviews", value: "all" },
    ];

const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const getStatusStyles = (status: string) => {
    switch (status) {
        case "approved":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";

        case "rejected":
            return "bg-rose-50 text-rose-700 border-rose-200";

        default:
            return "bg-amber-50 text-amber-700 border-amber-200";
    }
};

const AdminReviewsClient = ({
    initialReviews,
}: AdminReviewsClientProps) => {
    const [reviews, setReviews] =
        useState<AdminProductReview[]>(initialReviews);

    const [activeFilter, setActiveFilter] =
        useState<ReviewModerationFilter>("pending");

    const [loading, setLoading] = useState(false);
    const [moderatingId, setModeratingId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleFilterChange = async (
        filter: ReviewModerationFilter,
    ) => {
        setActiveFilter(filter);
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const result = await getAdminProductReviews(filter);
            setReviews(result);
        } catch (err) {
            console.error("Unable to load reviews:", err);
            setError("Unable to load reviews. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleModeration = async (
        reviewId: string,
        decision: "approved" | "rejected",
    ) => {
        const actionLabel = decision === "approved" ? "approve" : "reject";

        const confirmed = window.confirm(
            `Are you sure you want to ${actionLabel} this review?`,
        );

        if (!confirmed) return;

        setModeratingId(reviewId);
        setError("");
        setSuccess("");

        try {
            const result = await moderateProductReview(reviewId, decision);

            if (!result.success) {
                setError(result.message);
                return;
            }

            setReviews((currentReviews) =>
                currentReviews.map((review) =>
                    review._id === reviewId
                        ? { ...review, status: decision }
                        : review,
                ),
            );

            setSuccess(result.message);
        } catch (err) {
            console.error("Review moderation failed:", err);
            setError("Something went wrong. Please refresh and try again.");
        } finally {
            setModeratingId(null);
        }
    };

    const pendingCount = reviews.filter(
        (review) => review.status === "pending",
    ).length;

    return (
        <div className="space-y-7 pb-12">
            {/* Page header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-shop-dark-green">
                            <MessageSquare className="h-5 w-5" />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                                Product Reviews
                            </h1>
                            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                                Manage customer feedback and marketplace ratings.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => handleFilterChange(activeFilter)}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <RefreshCw
                        className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                    Refresh
                </button>
            </div>

            {/* Summary strip */}
            <div className="rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-shop-dark-green to-[#0A5136] p-5 text-white sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                        <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                            Review moderation
                        </p>
                        <h2 className="mt-1 text-lg font-bold">
                            Customer Feedback Management
                        </h2>
                    </div>
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-50/80">
                    Review customer feedback before it appears publicly on product
                    pages. Only approved reviews contribute to product ratings.
                </p>
            </div>

            {/* Feedback messages */}
            {error && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
                >
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
                >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>{success}</p>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                    <button
                        key={filter.value}
                        type="button"
                        onClick={() => handleFilterChange(filter.value)}
                        disabled={loading}
                        className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition-all sm:text-sm ${activeFilter === filter.value
                            ? "bg-shop-dark-green text-white shadow-sm"
                            : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/50"
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                        {filter.label}
                        {filter.value === "pending" && pendingCount > 0 && (
                            <span
                                className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${activeFilter === "pending"
                                    ? "bg-white/15 text-white"
                                    : "bg-amber-100 text-amber-800"
                                    }`}
                            >
                                {pendingCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Review list */}
            <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">
                            {filters.find((filter) => filter.value === activeFilter)?.label}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                            {reviews.length} review{reviews.length === 1 ? "" : "s"} found
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">
                        <Loader2 className="h-8 w-8 animate-spin text-shop-dark-green" />
                        <p className="mt-3 text-sm font-medium text-slate-500">
                            Loading reviews...
                        </p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                            <MessageSquare className="h-6 w-6" />
                        </div>

                        <h4 className="mt-4 text-sm font-bold text-slate-800">
                            No reviews found
                        </h4>

                        <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                            {activeFilter === "pending"
                                ? "There are currently no customer reviews waiting for approval."
                                : "No reviews match this filter yet."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => {
                            const isModerating = moderatingId === review._id;

                            return (
                                <article
                                    key={review._id}
                                    className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs"
                                >
                                    <div className="flex flex-col gap-4 p-4 sm:p-5">
                                        {/* Customer and status */}
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                                    <User className="h-5 w-5" />
                                                </div>

                                                <div className="min-w-0">
                                                    <h4 className="truncate text-sm font-bold text-slate-900">
                                                        {review.customerName || "Customer"}
                                                    </h4>

                                                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                                        <CalendarDays className="h-3.5 w-3.5" />
                                                        {formatDate(review.createdAt)}
                                                    </div>
                                                </div>
                                            </div>

                                            <span
                                                className={`w-fit rounded-full border px-3 py-1 text-[10px] font-bold capitalize ${getStatusStyles(review.status)}`}
                                            >
                                                {review.status}
                                            </span>
                                        </div>

                                        {/* Product */}
                                        <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-shop-dark-green shadow-xs">
                                                <Package className="h-4 w-4" />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                    Reviewed product
                                                </p>
                                                <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                                                    {review.product?.title || "Product unavailable"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Rating */}
                                        <div>
                                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                Customer rating
                                            </p>

                                            <div
                                                className="flex items-center gap-1"
                                                aria-label={`${review.rating} out of 5 stars`}
                                            >
                                                {Array.from({ length: 5 }, (_, index) => (
                                                    <Star
                                                        key={index}
                                                        className={`h-5 w-5 ${index < review.rating
                                                            ? "fill-amber-400 text-amber-400"
                                                            : "text-slate-200"
                                                            }`}
                                                    />
                                                ))}

                                                <span className="ml-2 text-xs font-bold text-slate-700">
                                                    {review.rating}/5
                                                </span>
                                            </div>
                                        </div>

                                        {/* Comment */}
                                        {review.comment ? (
                                            <div>
                                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                    Customer comment
                                                </p>

                                                <div className="rounded-xl border border-slate-100 bg-white p-3">
                                                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                                                        {review.comment}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs italic text-slate-400">
                                                No written comment provided.
                                            </p>
                                        )}

                                        {/* Order reference */}
                                        <div className="text-xs text-slate-500">
                                            Order reference:{" "}
                                            <span className="font-semibold text-slate-700">
                                                {review.order?.orderNumber || review.order?._id || "Unavailable"}
                                            </span>
                                        </div>

                                        {/* Moderation controls */}
                                        {review.status === "pending" && (
                                            <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleModeration(review._id, "rejected")
                                                    }
                                                    disabled={isModerating}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {isModerating ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4" />
                                                    )}
                                                    Reject Review
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleModeration(review._id, "approved")
                                                    }
                                                    disabled={isModerating}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-shop-dark-green px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-shop-light-green disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {isModerating ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    )}
                                                    Approve Review
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {pendingCount > 0 && activeFilter === "pending" && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                    <p className="text-xs leading-5 text-amber-900">
                        Pending reviews are not visible to customers and do not affect
                        public product ratings until approved.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdminReviewsClient;
