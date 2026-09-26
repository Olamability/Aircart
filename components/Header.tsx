import Container from "./Container";
import Logo from "./Logo";
import HeaderMenu from "./HeaderMenu";
import SearchBar from "./SearchBar";
import CartIcon from "./CartIcon";
import FavoriteButton from "./FavoriteButton";
import MobileMenu from "./MobileMenu";
import SignIn from "./SignIn";
import { ClerkLoaded } from "@clerk/nextjs";
import CustomUserButton from "./CustomUserButton";
import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Logs, LayoutDashboard } from "lucide-react";
import { getMyOrders } from "@/sanity/queries";
import { getUserRole } from "@/lib/roles";

const Header = async () => {
  const user = await currentUser();
  const { userId } = await auth();
  const role = await getUserRole();

  let dashboardHref: string | null = null;
  let dashboardLabel: string | null = null;

  if (role === "vendor") {
    dashboardHref = "/vendor";
    dashboardLabel = "Vendor";
  } else if (role === "product_manager") {
    dashboardHref = "/admin/products";
    dashboardLabel = "Product Manager";
  } else if (role === "admin") {
    dashboardHref = "/admin";
    dashboardLabel = "Admin";
  } else if (role === "super_admin") {
    dashboardHref = "/super-admin";
    dashboardLabel = "Super Admin";
  }

  let orders = null;
  if (userId) {
    orders = await getMyOrders(userId);
  }

  return (
    <header className="sticky border border-b-shop-light-green top-0 z-50 py-5 bg-white/70 backdrop-blur-md">
      <Container className="flex items-center justify-between text-lightColor">
        <div className="w-auto md:w-1/3 flex items-center justify-start gap-2.5 md:gap-0">
          <MobileMenu
            dashboardHref={dashboardHref}
            dashboardLabel={dashboardLabel}
          />
          <Logo />
        </div>
        <HeaderMenu />
        <div className="w-auto md:w-1/3 flex items-center justify-end gap-3 sm:gap-4">
          <SearchBar />
          <CartIcon />
          <FavoriteButton />

          {/* Quick Dashboard Entry for Merchants and Administrators */}
          {dashboardHref && (
            <Link
              href={dashboardHref}
              className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-shop-light-green/40 bg-shop-light-green/10 px-3 py-1.5 text-xs font-semibold text-shop-dark-green hover:bg-shop-dark-green hover:text-white transition"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>{dashboardLabel}</span>
            </Link>
          )}

          <ClerkLoaded>
            {user ? (
              <>
                <Link
                  href={"/orders"}
                  className="group relative hover:text-shop-light-green hoverEffect"
                >
                  <Logs />
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center">
                    {orders?.length ? orders?.length : 0}
                  </span>
                </Link>
                <CustomUserButton
                  dashboardHref={dashboardHref}
                  dashboardLabel={dashboardLabel}
                />
              </>
            ) : (
              <SignIn />
            )}
          </ClerkLoaded>
        </div>
      </Container>
    </header>
  );
};

export default Header;
