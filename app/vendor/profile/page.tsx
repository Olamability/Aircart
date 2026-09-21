import { getCurrentVendor } from "@/lib/vendor";
import VendorProfileForm from "@/components/VendorProfileForm";
import { notFound } from "next/navigation";
const VendorProfilePage = async () => {
  const vendor = await getCurrentVendor();
  if (!vendor) {
    notFound();
  }
  return (
    <div>
      {" "}
      <h1 className="text-2xl font-bold text-shop-dark-green">
        {" "}
        Vendor Profile{" "}
      </h1>{" "}
      <p className="mt-2 text-lightColor">
        {" "}
        Manage your business information and vendor identity.{" "}
      </p>{" "}
      <VendorProfileForm vendor={vendor} />{" "}
    </div>
  );
};
export default VendorProfilePage;
