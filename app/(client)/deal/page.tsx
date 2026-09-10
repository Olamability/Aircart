import React from "react";
import { getDealProduct } from "@/sanity/queries";
import Container from "@/components/Container";
import { Title } from "@/components/text";
import { FlameIcon } from "lucide-react";
import ProductCard from "@/components/ProductCard";

const DealPage = async () => {
  const products = await getDealProduct();
  return (
    <div className=" py-10 bg-deal-bg">
      <Container>
        <Title
          className="flex gap-2 items-center mb-5 underline underline-offset-4 
        decoration-1 text-base uppercase 
        tracking-wide"
        >
          Hot Deals of the Week
          <span>
            <FlameIcon className="text-red-600" />
          </span>
        </Title>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {products?.map((product) => (
            <ProductCard key={product?._id} product={product} />
          ))}
        </div>
      </Container>
    </div>
  );
};

export default DealPage;
