
import { notFound } from "next/navigation";

import { hasPermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import { getAdminProductReviews } from "@/actions/adminReviews";

import AdminReviewsClient from "@/components/dashboard/AdminReviewsClient";

const AdminReviewsPage = async () => {
    const canViewReviews = await hasPermission(permissions.reviews_view);

    if (!canViewReviews) {
        notFound();
    }

    const initialReviews = await getAdminProductReviews("pending");

    return (
        <AdminReviewsClient initialReviews={initialReviews} />
    );
};

export default AdminReviewsPage;
