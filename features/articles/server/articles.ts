import type { Metadata } from "next";

import { articles } from "@/features/articles/data/articles";
import type {
  Article,
  ArticleCategory,
  ArticleStatus,
} from "@/features/articles/types/article.types";

export function getPublishedArticles() {
  return articles
    .filter((article) => article.status === "published")
    .sort(sortByLatest);
}

export function getFeaturedArticles() {
  return getPublishedArticles().filter((article) => article.featured);
}

export function getFeaturedArticle() {
  return getFeaturedArticles()[0];
}

export function getArticleBySlug(slug: string) {
  return articles.find(
    (article) => article.slug === slug && article.status === "published",
  );
}

export function getArticleById(id: string) {
  return articles.find((article) => article.id === id);
}

export function getArticlesByCategory(category: ArticleCategory) {
  return getPublishedArticles().filter((article) => article.category === category);
}

export function getRelatedArticles(article: Article, count = 3) {
  return getPublishedArticles()
    .filter((candidate) => candidate.id !== article.id)
    .filter(
      (candidate) =>
        candidate.category === article.category ||
        candidate.tags.some((tag) => article.tags.includes(tag)),
    )
    .slice(0, count);
}

export function getAllTags(source = articles) {
  return Array.from(new Set(source.flatMap((article) => article.tags))).sort();
}

export function getArticleRouteParams() {
  return getPublishedArticles().map((article) => ({ slug: article.slug }));
}

export function getArticleMetadata(slug: string): Metadata {
  const article = getArticleBySlug(slug);

  if (!article) {
    return {};
  }

  return {
    title: article.title,
    description: article.annotation,
  };
}

export function getAdminStats() {
  const totalReadings = articles.reduce(
    (total, article) => total + article.readingCount,
    0,
  );
  const publishedCount = countStatus("published");
  const draftCount = countStatus("draft");
  const popularArticle = [...articles].sort(
    (a, b) => b.readingCount - a.readingCount,
  )[0];
  const popularTag = getMostPopularTag();

  return {
    totalArticles: articles.length,
    totalReadings,
    popularThisWeek: popularArticle,
    popularThisMonth: popularArticle,
    popularTag,
    recentArticles: [...articles].sort(sortByUpdated).slice(0, 5),
    publishedCount,
    draftCount,
  };
}

export function formatArticleDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function countStatus(status: ArticleStatus) {
  return articles.filter((article) => article.status === status).length;
}

function getMostPopularTag() {
  const tagCounts = new Map<string, number>();

  articles.forEach((article) => {
    article.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + article.readingCount);
    });
  });

  return [...tagCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "None";
}

function sortByLatest(a: Article, b: Article) {
  return (
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

function sortByUpdated(a: Article, b: Article) {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}
