import { desc, eq } from "drizzle-orm";

import { articlesTable } from "@/features/articles/db/article-schema";
import type { Article } from "@/features/articles/types/article";
import { db } from "@/shared/lib/db";

export async function listArticles(): Promise<Article[]> {
  return db
    .select()
    .from(articlesTable)
    .orderBy(desc(articlesTable.createdAt), desc(articlesTable.updatedAt));
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const [article] = await db
    .select()
    .from(articlesTable)
    .where(eq(articlesTable.slug, slug))
    .limit(1);

  return article ?? null;
}

export async function getArticleById(id: string): Promise<Article | null> {
  const [article] = await db
    .select()
    .from(articlesTable)
    .where(eq(articlesTable.id, id))
    .limit(1);

  return article ?? null;
}
