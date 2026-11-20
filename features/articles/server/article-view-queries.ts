import { and, eq, lt, sql } from "drizzle-orm";

import { articlesTable } from "@/features/articles/db/article-schema";
import {
  getDisplayedArticleViews,
  MAX_ARTICLE_VIEWS,
  type ArticleViewMode,
} from "@/features/articles/lib/article-views";
import { db } from "@/shared/lib/db";

export async function recordArticleView(id: string) {
  const [article] = await db
    .update(articlesTable)
    .set({
      views: sql`${articlesTable.views} + 1`,
      // Override Drizzle's $onUpdate: readership is not an editorial revision.
      updatedAt: sql`${articlesTable.updatedAt}`,
    })
    .where(
      and(
        eq(articlesTable.id, id),
        eq(articlesTable.status, "published"),
        lt(articlesTable.views, MAX_ARTICLE_VIEWS),
      ),
    )
    .returning({
      views: articlesTable.views,
      manualViews: articlesTable.manualViews,
      viewCountMode: articlesTable.viewCountMode,
    });

  return article ? getDisplayedArticleViews(article) : null;
}

export async function saveArticleViewSettings(
  id: string,
  settings: { viewCountMode: ArticleViewMode; manualViews: number },
) {
  const [article] = await db
    .update(articlesTable)
    .set({
      viewCountMode: settings.viewCountMode,
      manualViews: settings.manualViews,
      updatedAt: sql`${articlesTable.updatedAt}`,
    })
    .where(eq(articlesTable.id, id))
    .returning({
      slug: articlesTable.slug,
      views: articlesTable.views,
      manualViews: articlesTable.manualViews,
      viewCountMode: articlesTable.viewCountMode,
    });
  return article ?? null;
}
