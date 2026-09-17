import Container from "./Container";
import Logo from "./Logo";
import HeaderMenu from "./HeaderMenu";
import SearchBar from "./SearchBar";
import CartIcon from "./CartIcon";
import FavoriteButton from "./FavoriteButton";
import MobileMenu from "./MobileMenu";
import SignIn from "./SignIn";
import { ClerkLoaded, UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Logs } from "lucide-react";
import { getMyOrders } from "@/sanity/queries";

const Header = async () => {
  const user = await currentUser();
  const { userId } = await auth();
  let orders = null;
  if (userId) {
    orders = await getMyOrders(userId);
  }
  return (
    <header className="sticky top-0 z-50 py-5 bg-white/70 backdrop-blur-md">
      <Container className="flex items-center justify-between text-lightColor">
        <div className="w-auto md:w-1/3 flex items-center justify-start gap-2.5 md:gap-0">
          <MobileMenu />
          <Logo />
        </div>
        <HeaderMenu />
        <div className="w-auto md:w-1/3 flex items-center justify-end gap-5">
          <SearchBar />
          <CartIcon />
          <FavoriteButton />
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
                <UserButton />
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
