import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getActiveProducts } from "@/lib/server/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getActiveProducts();
  const now = new Date();

  return [
    { url: site.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${site.url}/shop`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${site.url}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...products.map((product) => ({
      url: `${site.url}/shop/${product.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
