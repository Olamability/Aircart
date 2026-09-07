import React from "react";

const BlogPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  return (
    <div>
      <h1>Blog Page: {}</h1>
      <p>Slug: {slug}</p>
    </div>
  );
};

export default BlogPage;