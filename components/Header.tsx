import Container from './Container';
import Logo from './Logo';
import HeaderMenu from './HeaderMenu';
import SearchBar from './SearchBar';
import CartIcon from './CartIcon';
import FavouriteButton from './FavouriteButton';
import MobileMenu from './MobileMenu';
import SignIn from './SignIn';
import { Show, UserButton } from '@clerk/nextjs';

const Header = async() => {
  
  
  return ( 
    <header className=" bg-white/70 py-5 sticky top-0 z-50 border border-b-shop-dark-green/20 backdrop-blur-md">
      <Container className="flex items-center justify-between text-shop-dark-green">
        <div className="w-auto md:w-1/3 flex items-center justify-start gap-2.5 md:gap-0">
        <MobileMenu />
        <Logo />
        </div>
        <HeaderMenu />
        <div className="w-auto md:w-1/3 flex items-center justify-end gap-5">
        <SearchBar />
        <CartIcon />
        <FavouriteButton />
        
          <Show when="signed-in">
            <UserButton />
          </Show>

          <Show when="signed-out">
            <SignIn />
          </Show>
        </div>
      
      </Container>
    </header>
    );
  
};

export default Header;
