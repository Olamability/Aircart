import { getCurrentVendor } from "@/lib/vendor";
import VendorProfileForm from "@/components/VendorProfileForm";

const VendorProfilePage = async () => {
  const vendor = await getCurrentVendor();

  return (
    <div>
      <h1 className="text-2xl font-bold text-shop-dark-green">
        {vendor ? "Vendor Profile" : "Complete Your Store Profile"}
      </h1>
      <p className="mt-2 text-lightColor">
        {vendor
          ? "Manage your business information and vendor identity."
          : "Provide your business details and logo to get your store ready."}
      </p>
      <VendorProfileForm vendor={vendor} />
    </div>
  );
};

export default VendorProfilePage;
