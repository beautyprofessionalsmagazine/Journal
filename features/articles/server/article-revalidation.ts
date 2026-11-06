import { revalidatePath } from "next/cache";

import { getArticlePath } from "@/features/articles/seo/article-seo";

/**
 * Public pages that are prerendered and list, link to, or index articles.
 * Category and /shopping pages are rendered per request (they read search
 * params), so they need no entry here.
 *
 * The sitemap and the feed are included on purpose: both are cached, and a
 * newly published article is only discoverable by crawlers once they list it.
 */
const ARTICLE_LISTING_PATHS = [
  "/",
  "/articles",
  "/archive",
  "/current-issue",
  "/sitemap.xml",
  "/feed.xml",
] as const;

/**
 * Refreshes every public surface an article touches. Call it after any change
 * to an article that can alter what readers or crawlers see (create, edit,
 * publish, unpublish, slug change).
 *
 * When the slug changed, the old URL is refreshed as well so it stops serving
 * a stale copy of the article.
 */
export function revalidateArticleSurfaces(
  slug: string,
  previousSlug?: string | null,
) {
  for (const path of ARTICLE_LISTING_PATHS) {
    revalidatePath(path);
  }

  revalidatePath(getArticlePath(slug));

  if (previousSlug && previousSlug !== slug) {
    revalidatePath(getArticlePath(previousSlug));
  }
}
