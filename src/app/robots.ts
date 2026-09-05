import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/server/deployment";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nothing behind these is useful to a crawler, and /admin is private.
      disallow: ["/admin", "/login", "/cart", "/checkout", "/api/"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
