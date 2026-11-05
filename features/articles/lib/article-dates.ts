import type { Article } from "@/features/articles/types/article";

type ArticleDates = Pick<Article, "createdAt" | "publishedAt" | "updatedAt">;

/**
 * A save made close to publication is usually setup or formatting, not a
 * reader-meaningful update. Keep the visible date and structured data aligned
 * by exposing `dateModified` only after a full day has elapsed.
 */
const MEANINGFUL_UPDATE_THRESHOLD_MS = 24 * 60 * 60 * 1_000;

export function getArticleDates(article: ArticleDates) {
  const published = article.publishedAt ?? article.createdAt;
  const modified =
    article.updatedAt.getTime() - published.getTime() >=
    MEANINGFUL_UPDATE_THRESHOLD_MS
      ? article.updatedAt
      : null;

  return { published, modified };
}
