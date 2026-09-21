import { client } from "./client";
import { BRAND_SEARCH_QUERY } from "../queries";
export const searchBrands = async (search: string) => {
  const value = search.trim().toLowerCase();
  if (!value) {
    return [];
  }
  const brands = await client.fetch(BRAND_SEARCH_QUERY, {
    search: `*${value}*`,
  });
  return brands;
};
