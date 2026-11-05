import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/shared/seo/site";

/**
 * Crawl rules. Everything public is crawlable; the editorial back office and
 * the upload/API endpoints are not.
 *
 * Filter, search, and sort URLs (`?q=`, `?tag=`, `?sort=` ...) are deliberately
 * NOT disallowed here: they carry `noindex, follow` in their metadata, and a
 * crawler can only honour a noindex on a page it is allowed to fetch.
 */
export const DISALLOWED_PATHS = ["/admin", "/api/"] as const;

export function buildRobots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...DISALLOWED_PATHS],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
