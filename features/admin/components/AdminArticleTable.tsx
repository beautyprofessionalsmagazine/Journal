"use client";

import Link from "next/link";
import { Edit, EyeOff, Send, Trash2 } from "lucide-react";
import { useState } from "react";

import { categoryConfigs } from "@/features/articles/data/categories";
import { getAllTags } from "@/features/articles/lib/articles";
import type { Article, ArticleStatus } from "@/features/articles/types/article.types";

type AdminArticleTableProps = {
  articles: Article[];
};

export function AdminArticleTable({ articles }: AdminArticleTableProps) {
  const [rows, setRows] = useState(articles);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ArticleStatus | "all">("all");
  const [category, setCategory] = useState("all");
  const [tag, setTag] = useState("all");

  const tags = getAllTags(rows);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredRows = rows.filter((article) => {
    if (status !== "all" && article.status !== status) {
      return false;
    }

    if (category !== "all" && article.category !== category) {
      return false;
    }

    if (tag !== "all" && !article.tags.includes(tag)) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return [
      article.title,
      article.subtitle,
      article.author,
      article.category,
      article.subcategory,
      ...article.tags,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  function updateStatus(id: string, nextStatus: ArticleStatus) {
    setRows((currentRows) =>
      currentRows.map((article) =>
        article.id === id ? { ...article, status: nextStatus } : article,
      ),
    );
  }

  function deleteArticle(id: string) {
    setRows((currentRows) => currentRows.filter((article) => article.id !== id));
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="grid gap-4 border-y border-black/15 py-5 lg:grid-cols-[minmax(240px,1fr)_repeat(3,180px)]">
        <label className="flex flex-col gap-2 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase">
          Search articles
          <input
            className="min-h-11 border border-black/20 px-3 text-sm font-normal normal-case outline-none focus:border-black"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search articles"
            type="search"
            value={query}
          />
        </label>
        <label className="flex flex-col gap-2 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase">
          Status
          <select
            className="min-h-11 border border-black/20 px-3 text-sm font-normal normal-case outline-none focus:border-black"
            onChange={(event) => setStatus(event.target.value as ArticleStatus | "all")}
            value={status}
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase">
          Category
          <select
            className="min-h-11 border border-black/20 px-3 text-sm font-normal normal-case outline-none focus:border-black"
            onChange={(event) => setCategory(event.target.value)}
            value={category}
          >
            <option value="all">All categories</option>
            {categoryConfigs.map((item) => (
              <option key={item.slug} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase">
          Tag
          <select
            className="min-h-11 border border-black/20 px-3 text-sm font-normal normal-case outline-none focus:border-black"
            onChange={(event) => setTag(event.target.value)}
            value={tag}
          >
            <option value="all">All tags</option>
            {tags.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredRows.length === 0 ? (
        <div className="border-y border-black/15 py-16 text-center">
          <h2 className="[font-family:var(--font-editorial-title)] text-3xl font-bold">
            No articles match these filters
          </h2>
          <p className="mt-3 [font-family:var(--font-editorial-sans)] text-sm text-black/62">
            Clear the search or choose a different status, category, or tag.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-black/15">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead className="border-b border-black/15 bg-black text-white">
              <tr className="[font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((article) => (
                <tr className="border-b border-black/10 align-top" key={article.id}>
                  <td className="px-4 py-4">
                    <p className="[font-family:var(--font-editorial-title)] text-xl font-bold leading-tight">
                      {article.title}
                    </p>
                    <p className="mt-1 [font-family:var(--font-editorial-sans)] text-xs text-black/58">
                      {article.slug}
                    </p>
                  </td>
                  <td className="px-4 py-4 [font-family:var(--font-editorial-sans)] text-sm">
                    {article.category}
                    <span className="block text-black/58">{article.subcategory}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {article.tags.slice(0, 3).map((item) => (
                        <span
                          className="border border-black/15 px-2 py-1 [font-family:var(--font-editorial-sans)] text-xs uppercase"
                          key={item}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="border border-black px-2 py-1 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase">
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 [font-family:var(--font-editorial-body-sans)] text-sm italic text-black/62">
                    {new Date(article.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        className="inline-flex size-10 items-center justify-center border border-black/20 transition hover:border-black"
                        href={`/admin/articles/${article.id}/edit`}
                        title="Edit"
                      >
                        <Edit aria-hidden="true" strokeWidth={1.5} />
                      </Link>
                      {article.status === "draft" ? (
                        <button
                          className="inline-flex size-10 items-center justify-center border border-black/20 transition hover:border-black"
                          onClick={() => updateStatus(article.id, "published")}
                          title="Publish"
                          type="button"
                        >
                          <Send aria-hidden="true" strokeWidth={1.5} />
                        </button>
                      ) : (
                        <button
                          className="inline-flex size-10 items-center justify-center border border-black/20 transition hover:border-black"
                          onClick={() => updateStatus(article.id, "draft")}
                          title="Unpublish"
                          type="button"
                        >
                          <EyeOff aria-hidden="true" strokeWidth={1.5} />
                        </button>
                      )}
                      <button
                        className="inline-flex size-10 items-center justify-center border border-black/20 transition hover:border-black"
                        onClick={() => deleteArticle(article.id)}
                        title="Delete"
                        type="button"
                      >
                        <Trash2 aria-hidden="true" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
