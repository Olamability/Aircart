import Link from "next/link";
import { getCurrentVendorProducts } from "@/lib/vendorProducts";

const VendorProductsPage = async () => {
  const products = await getCurrentVendorProducts();

  return (
    <div>
      <h1 className="text-2xl font-bold text-shop-dark-green">My Products</h1>

      <p className="mt-2 text-lightColor">Manage your products from here.</p>
      <Link
        href="/vendor/products/new"
        className="mt-4 inline-block rounded-md bg-shop-light-green px-5 py-3 font-semibold text-white hover:bg-shop-dark-green hoverEffect"
      >
        Add Product
      </Link>

      <div className="mt-6">
        {products.length === 0 ? (
          <p className="text-lightColor">You have no products yet.</p>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product._id}
                className="rounded-md border border-shop-light-green p-4"
              >
                <h2 className="font-semibold text-shop-dark-green">
                  {product.title}
                </h2>

                <p className="mt-1">Price: ₦{product.price}</p>

                <p className="mt-1">Stock: {product.stock}</p>

                <Link
                  href={`/vendor/products/${product._id}/edit`}
                  className="mt-3 inline-block rounded-md bg-shop-light-green px-4 py-2 font-medium text-white hover:bg-shop-dark-green hoverEffect"
                >
                  Edit Product
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorProductsPage;
