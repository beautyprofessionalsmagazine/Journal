"use client";

import { useState } from "react";

import { ArticleFilters } from "@/features/articles/components/ArticleFilters";
import { ArticleGrid } from "@/features/articles/components/ArticleGrid";
import type { Article } from "@/features/articles/types/article";

type ArticleExplorerProps = {
  articles: Article[];
  initialCategory?: string;
  title?: string;
};

export function ArticleExplorer({
  articles,
  initialCategory,
  title = "Latest Articles",
}: ArticleExplorerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(initialCategory ?? "all");
  const [tag, setTag] = useState("all");
  const [sort, setSort] = useState("latest");

  const categories = Array.from(
    new Set(articles.map((article) => article.category)),
  ).sort();
  const tags = Array.from(
    new Set(articles.flatMap((article) => article.tags)),
  ).sort();

  const normalizedQuery = query.trim().toLowerCase();
  const filteredArticles = [...articles]
    .filter((article) => {
      if (category !== "all" && article.category !== category) {
        return false;
      }

      if (tag !== "all" && !article.tags.includes(tag)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchable = [
        article.title,
        article.description ?? "",
        article.author,
        article.category,
        ...article.tags,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    })
    .sort((a, b) => {
      if (sort === "popular") {
        return b.views - a.views;
      }

      return (
        (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0)
      );
    });

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h2 className="[font-family:var(--font-editorial-title)] text-4xl font-bold text-black sm:text-5xl">
          {title}
        </h2>
        <p className="max-w-lg [font-family:var(--font-editorial-sans)] text-sm leading-6 text-black/62">
          Search by title, description, author, tags, or category.
        </p>
      </div>
      <ArticleFilters
        categories={categories}
        category={category}
        onCategoryChange={setCategory}
        onQueryChange={setQuery}
        onSortChange={setSort}
        onTagChange={setTag}
        query={query}
        resultCount={filteredArticles.length}
        sort={sort}
        tag={tag}
        tags={tags}
      />
      <ArticleGrid articles={filteredArticles} />
    </section>
  );
}
