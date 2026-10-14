import { listPublishedArticles } from "@/features/articles/server/article-queries";
import { getArticleDescription, getArticlePath } from "@/features/articles/seo/article-seo";
import { buildRssFeed } from "@/shared/seo/rss";
import { SITE } from "@/shared/seo/site";
import { getAuthorName } from "@/shared/seo/text";

// Refreshed at most hourly, and immediately whenever an article is saved
// (see article-revalidation).
export const revalidate = 3600;

const FEED_ITEM_LIMIT = 30;

export async function GET() {
  const articles = await listPublishedArticles({
    sort: "latest",
    limit: FEED_ITEM_LIMIT,
  });

  const xml = buildRssFeed({
    title: SITE.name,
    description: SITE.description,
    language: SITE.language,
    lastBuildDate: articles.reduce<Date | null>(
      (latest, article) =>
        !latest || article.updatedAt > latest ? article.updatedAt : latest,
      null,
    ),
    items: articles.map((article) => ({
      title: article.title,
      path: getArticlePath(article.slug),
      description: getArticleDescription(article),
      publishedAt: article.publishedAt ?? article.createdAt,
      category: article.category,
      tags: article.tags,
      author: getAuthorName(article.author),
    })),
  });

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
