
import { getCurrentVendor } from "@/lib/vendor";
import { getVendorDashboardStats } from "@/sanity/queries/vendorQueries";
import VendorProfileClient from "@/components/vendor/VendorProfileClient";

export default async function VendorProfilePage() {
  const vendor = await getCurrentVendor();

  if (!vendor) {
    return (
      <div className="rounded-xl border border-[#E1E6E1] bg-white p-8">
        <h2 className="text-lg font-semibold text-[#063C28]">
          Vendor profile unavailable
        </h2>
        <p className="mt-2 text-sm text-[#737B73]">
          We couldn't find a vendor profile associated with your account.
          Please contact support if you believe this is an error.
        </p>
      </div>
    );
  }

  const stats = await getVendorDashboardStats(vendor._id);

  return <VendorProfileClient vendor={vendor} stats={stats} />;
}
