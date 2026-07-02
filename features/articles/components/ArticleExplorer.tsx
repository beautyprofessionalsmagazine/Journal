"use client";

import { useState } from "react";

import { ArticleFilters } from "@/features/articles/components/ArticleFilters";
import { ArticleGrid } from "@/features/articles/components/ArticleGrid";
import { getAllTags } from "@/features/articles/server/articles";
import type {
  Article,
  ArticleCategory,
} from "@/features/articles/types/article.types";
import { categoryConfigs } from "@/features/categories/data/categories";

type ArticleExplorerProps = {
  articles: Article[];
  initialCategory?: ArticleCategory;
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

  const categories = categoryConfigs.map((item) => item.name);
  const tags = getAllTags(articles);

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
        article.subtitle,
        article.annotation,
        article.author,
        article.category,
        article.subcategory,
        ...article.tags,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    })
    .sort((a, b) => {
      if (sort === "popular") {
        return b.readingCount - a.readingCount;
      }

      return (
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    });

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h2 className="[font-family:var(--font-editorial-title)] text-4xl font-bold text-black sm:text-5xl">
          {title}
        </h2>
        <p className="max-w-lg [font-family:var(--font-editorial-sans)] text-sm leading-6 text-black/62">
          Search by title, subtitle, author, tags, or category.
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
