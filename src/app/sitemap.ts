import type { MetadataRoute } from "next";
import { API_URL, SITE_URL } from "@/lib/config";
import type { Paginated, ProductSummary } from "@/lib/types";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.8 },
  ];

  try {
    let next: string | null = `${API_URL}/api/products/?page_size=60`;
    while (next) {
      const response: Response = await fetch(next, { next: { revalidate: 3600 } });
      if (!response.ok) break;
      const data = (await response.json()) as Paginated<ProductSummary>;
      for (const product of data.results) {
        entries.push({
          url: `${SITE_URL}/products/${product.slug}`,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
      next = data.next;
    }
  } catch {
    // If the API is unreachable the sitemap still lists the main pages.
  }
  return entries;
}