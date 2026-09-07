import React from 'react'
import Container from '@/components/Container';
import HomeBanner from '@/components/HomeBanner';
import ProductGrid from '@/components/ProductGrid';
import HomeCategories from '@/components/HomeCategories';
import { getCategories } from '@/sanity/queries';
import ShopByBrand from '@/components/ShopByBrand';
import LatestBlog from '@/components/LatestBlog';


const Home = async() => {
  const categories = await getCategories(6);
  console.log(categories);

  return (
    <Container className="">
      <HomeBanner />
      <div className="py-10">
      <ProductGrid />
      </div>
      <HomeCategories categories={categories} />
      <ShopByBrand />
      <LatestBlog />

    </Container>
  );
};

export default Home;
