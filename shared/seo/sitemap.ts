import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/shared/seo/site";

export type SitemapArticle = {
  slug: string;
  category: string;
  updatedAt: Date;
  /** Absolute or site-relative image URLs for the page, cover first. */
  imageUrls: string[];
};

export type SitemapLookbook = {
  issueYear: number;
  issueMonth: number;
  updatedAt: Date;
};

export type SitemapCategory = {
  name: string;
  /** Site path, e.g. "/category/beauty" or "/shopping". */
  href: string;
};

export type SitemapStaticPage = {
  path: string;
};

export type SitemapInput = {
  staticPages: readonly SitemapStaticPage[];
  categories: readonly SitemapCategory[];
  /** Published articles, newest first. */
  articles: readonly SitemapArticle[];
  /** Lookbook editions, newest first. */
  lookbooks: readonly SitemapLookbook[];
};

function latest(dates: readonly Date[]): Date | undefined {
  return dates.length > 0
    ? new Date(Math.max(...dates.map((date) => date.getTime())))
    : undefined;
}

/**
 * Builds sitemap entries from already-fetched data. Pure on purpose, so the
 * rules (what is listed, what `lastModified` means) are unit-tested without a
 * database.
 *
 * Rules:
 * - Only canonical, indexable URLs are listed; the sitemap must agree with each
 *   page's rel=canonical, because Google treats a mismatch as a conflicting
 *   signal.
 * - `lastModified` is only set where a real date exists. A made-up date is
 *   worse than none.
 * - Category pages without a published article are omitted: they render as
 *   empty listings and carry `noindex`.
 */
export function buildSitemapEntries(
  input: SitemapInput,
): MetadataRoute.Sitemap {
  const newestArticle = latest(input.articles.map((article) => article.updatedAt));
  const entries: MetadataRoute.Sitemap = [];

  entries.push({ url: absoluteUrl("/"), lastModified: newestArticle });
  entries.push({ url: absoluteUrl("/articles"), lastModified: newestArticle });

  for (const category of input.categories) {
    const inCategory = input.articles.filter(
      (article) => article.category === category.name,
    );

    if (inCategory.length === 0) {
      continue;
    }

    entries.push({
      url: absoluteUrl(category.href),
      lastModified: latest(inCategory.map((article) => article.updatedAt)),
    });
  }

  for (const page of input.staticPages) {
    entries.push({ url: absoluteUrl(page.path) });
  }

  if (input.lookbooks.length > 0) {
    const [newest, ...older] = input.lookbooks;

    // /lookbook always shows the newest edition, so it carries that edition's date.
    entries.push({
      url: absoluteUrl("/lookbook"),
      lastModified: newest.updatedAt,
    });

    for (const edition of older) {
      entries.push({
        url: absoluteUrl(
          `/lookbook?year=${edition.issueYear}&month=${edition.issueMonth}`,
        ),
        lastModified: edition.updatedAt,
      });
    }
  }

  for (const article of input.articles) {
    entries.push({
      url: absoluteUrl(`/articles/${article.slug}`),
      lastModified: article.updatedAt,
      ...(article.imageUrls.length > 0
        ? { images: article.imageUrls.map((url) => absoluteUrl(url)) }
        : {}),
    });
  }

  return entries;
}
