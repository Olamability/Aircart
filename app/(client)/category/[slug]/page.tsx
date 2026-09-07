import React from "react";

const CategoryPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  return (
    <div>
      <h1>Category Page</h1>
      <p>{slug}</p>
    </div>
  );
};

export default CategoryPage;