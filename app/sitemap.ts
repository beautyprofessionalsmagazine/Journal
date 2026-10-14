import type { MetadataRoute } from "next";

import { getArticleImages } from "@/features/articles/seo/article-seo";
import { listPublishedArticleSitemapEntries } from "@/features/articles/server/article-queries";
import { categoryConfigs } from "@/features/categories/data/categories";
import { getLookbooks } from "@/features/lookbook/server/lookbook-queries";
import { getSitemapStaticPages } from "@/shared/seo/pages";
import { buildSitemapEntries } from "@/shared/seo/sitemap";

// Regenerated at most hourly; publishing, editing, or removing an article or
// Lookbook edition also revalidates it immediately (see article-revalidation).
export const revalidate = 3600;

/**
 * A failed read must not take the whole sitemap down (or fail the build): the
 * affected section is left out and the error is logged, so Search Console
 * still receives every URL that could be listed.
 */
async function readOrEmpty<T>(label: string, read: () => Promise<T[]>) {
  try {
    return await read();
  } catch (error) {
    console.error(`sitemap: could not read ${label}`, error);
    return [] as T[];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, lookbooks] = await Promise.all([
    readOrEmpty("articles", listPublishedArticleSitemapEntries),
    readOrEmpty("lookbook editions", getLookbooks),
  ]);

  return buildSitemapEntries({
    staticPages: getSitemapStaticPages(),
    categories: categoryConfigs.map(({ name, href }) => ({ name, href })),
    articles: articles.map((article) => ({
      slug: article.slug,
      category: article.category,
      updatedAt: article.updatedAt,
      imageUrls: getArticleImages({
        coverImage: article.coverImage,
        title: article.slug,
      }).structured,
    })),
    lookbooks,
  });
}
