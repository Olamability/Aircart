"use server";
import { client } from "@/sanity/lib/client";
export const searchCategories = async (search: string) => {
  const value = search.trim();
  if (!value) {
    return [];
  }
  const categories = await client.fetch(
    `*[ _type == "category" && title match $search ] | order(title asc)[0...10]{ _id, title }`,
    { search: `${value}*` },
  );
  return categories;
};
