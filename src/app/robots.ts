import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nothing behind these is useful to a crawler, and /admin is private.
      disallow: ["/admin", "/login", "/cart", "/checkout", "/api/"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
