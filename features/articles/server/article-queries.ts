import {
  and,
  arrayContains,
  arrayOverlaps,
  desc,
  eq,
  ilike,
  ne,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import { articlesTable } from "@/features/articles/db/article-schema";
import type {
  Article,
  ArticleStatus,
} from "@/features/articles/types/article";
import { db } from "@/shared/lib/db";

export type ArticleSort = "latest" | "popular";

export type PublishedArticleFilters = {
  category?: string;
  tag?: string;
  query?: string;
  sort?: ArticleSort;
  excludeId?: string;
  limit?: number;
};

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

export async function listPublishedArticles(
  filters: PublishedArticleFilters = {},
): Promise<Article[]> {
  const conditions: SQL[] = [eq(articlesTable.status, "published")];
  const category = filters.category?.trim();
  const tag = filters.tag?.trim();
  const query = filters.query?.trim();

  if (category) {
    conditions.push(eq(articlesTable.category, category));
  }

  if (tag) {
    conditions.push(arrayContains(articlesTable.tags, [tag]));
  }

  if (query) {
    const searchPattern = `%${query}%`;
    const textMatch = or(
      ilike(articlesTable.title, searchPattern),
      ilike(articlesTable.description, searchPattern),
      ilike(articlesTable.author, searchPattern),
      ilike(articlesTable.slug, searchPattern),
      ilike(sql`${articlesTable.contentJson}::text`, searchPattern),
    );

    if (textMatch) {
      conditions.push(textMatch);
    }
  }

  if (filters.excludeId) {
    conditions.push(ne(articlesTable.id, filters.excludeId));
  }

  const orderBy =
    filters.sort === "popular"
      ? [desc(articlesTable.views), desc(articlesTable.publishedAt)]
      : [desc(articlesTable.publishedAt), desc(articlesTable.createdAt)];
  const queryBuilder = db
    .select()
    .from(articlesTable)
    .where(and(...conditions))
    .orderBy(...orderBy);

  if (filters.limit) {
    return queryBuilder.limit(filters.limit);
  }

  return queryBuilder;
}

export async function getPublishedArticleBySlug(
  slug: string,
): Promise<Article | null> {
  const [article] = await db
    .select()
    .from(articlesTable)
    .where(
      and(
        eq(articlesTable.slug, slug),
        eq(articlesTable.status, "published"),
      ),
    )
    .limit(1);

  return article ?? null;
}

export async function getFeaturedArticle(): Promise<Article | null> {
  const [article] = await listPublishedArticles({
    limit: 1,
    sort: "popular",
  });

  return article ?? null;
}

export async function getRelatedArticles(
  article: Article,
  limit = 3,
): Promise<Article[]> {
  const relatedMatch =
    article.tags.length > 0
      ? or(
          eq(articlesTable.category, article.category),
          arrayOverlaps(articlesTable.tags, article.tags),
        )
      : eq(articlesTable.category, article.category);

  return db
    .select()
    .from(articlesTable)
    .where(
      and(
        eq(articlesTable.status, "published"),
        ne(articlesTable.id, article.id),
        relatedMatch,
      ),
    )
    .orderBy(desc(articlesTable.publishedAt), desc(articlesTable.views))
    .limit(limit);
}

export async function getPublishedArticleFilterOptions() {
  const rows = await db
    .select({
      category: articlesTable.category,
      tags: articlesTable.tags,
    })
    .from(articlesTable)
    .where(eq(articlesTable.status, "published"));

  return {
    categories: Array.from(
      new Set(rows.map((article) => article.category)),
    ).sort(),
    tags: Array.from(new Set(rows.flatMap((article) => article.tags))).sort(),
  };
}

export async function getPublishedArticleRouteParams() {
  return db
    .select({
      slug: articlesTable.slug,
    })
    .from(articlesTable)
    .where(eq(articlesTable.status, "published"));
}

export async function getAdminStats() {
  const articles = await listArticles();
  const totalViews = articles.reduce(
    (total, article) => total + article.views,
    0,
  );
  const publishedCount = countStatus(articles, "published");
  const draftCount = countStatus(articles, "draft");
  const popularArticle = [...articles].sort((a, b) => b.views - a.views)[0];

  return {
    totalArticles: articles.length,
    totalViews,
    popularThisWeek: popularArticle,
    popularThisMonth: popularArticle,
    popularTag: getMostPopularTag(articles),
    recentArticles: [...articles]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5),
    publishedCount,
    draftCount,
  };
}

function countStatus(articles: Article[], status: ArticleStatus) {
  return articles.filter((article) => article.status === status).length;
}

function getMostPopularTag(articles: Article[]) {
  const tagViews = new Map<string, number>();

  articles.forEach((article) => {
    article.tags.forEach((tag) => {
      tagViews.set(tag, (tagViews.get(tag) ?? 0) + article.views);
    });
  });

  return [...tagViews.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "None";
}
