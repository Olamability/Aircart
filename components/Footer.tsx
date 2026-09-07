import React from 'react'
import Container from "./Container";
import SocialMedia from './SocialMedia';
import Logo from './Logo';
import FooterTop from './FooterTop';
import { SubText, SubTitle } from './text';
import { quickLinksData, categoriesData,  } from '@/constants/data';
import Link from 'next/link';
import { Input } from './ui/input';
import { Button } from '@base-ui/react';

const Footer = () => {
  return (
    <footer>
      <div className=" bg-white border-t border-b border-gray/50 mt-10">
      <Container>
        <FooterTop />
        </Container>
        </div>

        <Container className="flex flex-col py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
        <div className="text-shop-dark-green flex flex-col items-start gap-5">
          <Logo />
          <p className="text-gray-600 text-sm">Discover amazing curated products collections at Airmart</p>
          <SocialMedia className="hover:text-shop-dark-green/60" 
          iconClassName="border-shop-light-green hover:text-shop-dark-green/60 hover:border-shop-dark-green"
          tooltipClassName="hover:bg-darkColor"/>
        </div>
          </div>
        <div>
          <SubTitle>Quick Links
            <ul className="space-y-3 mt-4">
              {quickLinksData?.map((item) => (
                <li key={item?.title}>
                  <Link href={item?.href} className="hover:text-shop-light-green hoverEffect font-medium">
                    {item?.title}
                    </Link>
                </li>
               
              ))}
            </ul>
          </SubTitle>
          </div>  
        <div>
          <SubTitle>Categories
            <ul className="space-y-3 mt-4">
              {categoriesData?.map((item) => (
                <li key={item?.title}>
                  <Link href={`/category/$(item?.href)`} className="hover:text-shop-light-green hoverEffect font-medium">
                    {item?.title}
                    </Link>
                </li>
               
              ))}
            </ul>
          </SubTitle>
          </div>
        <div className="space-y-4">
          <SubTitle>Newsletter</SubTitle>
          <SubText>Subscribe to our newsletter to receive updates and exclusive offers.</SubText>
          <form className="space-y-3">
            <Input type="email" placeholder="Please enter your email" required/>
            <Button type="submit" className="w-full bg-shop-dark-green/90 text-white px-5 py-2 rounded-md text-sm font-semibold hover:text-white
            hover:bg-shop-dark-green hoverEffect mt-2">Subscribe</Button>
          </form>
          </div>
           </div>
           <div className="w-full border-t mt-12 pt-6">

            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
              <span>© {new Date().getFullYear()} </span><Logo className="text-sm"/><span>| All rights reserved.</span>
            </div>
            </div>
      </Container>   
    </footer>
  );
};

export default Footer;
