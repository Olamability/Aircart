import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getBlogs } from "@/sanity/queries";
import { urlFor } from "@/sanity/lib/image";
import { Title } from "./text";

const LatestBlog = async () => {
  
  const blogs = await getBlogs();
  console.log("Latest Blogs:", blogs);

  return (
    <div className="mb-10 lg:mb-20 py-2 bg-shop-light-bg">
      <div className="flex items-center justify-between mb-6">
        <Title className="font-bold">Latest Blog</Title>

        <Link
          href="/blog"
          className="text-sm font-semibold tracking-wide hover:text-shop-btn-dark-green hoverEffect"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {blogs?.map((blog) => (
          <Link 
            href={`/blog/${blog?.slug?.current}`}
            key={blog?._id}
            className="group overflow-hidden rounded-md border border-shop-light-green/20 hover:shadow-lg hoverEffect"
          >
            {blog?.image && (
              <div className="overflow-hidden">
                <Image
                  src={urlFor(blog.image).url()}
                  alt={blog?.title || "Blog image"}
                  width={500}
                  height={350}
                  className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <hr />

            <div className="p-4 bg-shop-lighter-text/20">
              <div className="flex flex-1 font-semibold gap-4 mb-2 ">
              {blog?.category && (
                <p className="text-xs uppercase text-shop-light-text">
                  {blog.category}
                </p>
              )}

              <p className="text-xs text-shop-light-text">
                {blog?.publishedAt
                  ? new Date(blog.publishedAt).toLocaleDateString("en-NG")
                  : ""}
              </p>
              </div>
              <hr />

              <h3 className="font-semibold line-clamp-2 group-hover:text-shop-dark-green">
                {blog?.title}
              </h3>
              
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LatestBlog;