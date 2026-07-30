"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type ArticleFiltersProps = {
  categories: string[];
  tags: string[];
  query: string;
  category: string;
  tag: string;
  sort: string;
  resultCount: number;
  categoryLocked?: boolean;
};

export function ArticleFilters({
  categories,
  tags,
  query,
  category,
  tag,
  sort,
  resultCount,
  categoryLocked = false,
}: ArticleFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateFilter(
    name: "q" | "category" | "tag" | "sort",
    value: string,
  ) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    const isDefaultValue =
      !value ||
      value === "all" ||
      (name === "sort" && value === "latest");

    if (isDefaultValue) {
      nextSearchParams.delete(name);
    } else {
      nextSearchParams.set(name, value);
    }

    const queryString = nextSearchParams.toString();
    const destination = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.replace(destination, {
        scroll: false,
      });
    });
  }

  return (
    <section
      aria-label="Article filters"
      aria-busy={isPending}
      className="grid gap-4 border-y border-black/15 py-5 lg:grid-cols-[minmax(240px,1.1fr)_repeat(3,minmax(150px,0.5fr))_auto] lg:items-end"
    >
      <label className="flex flex-col gap-2 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase text-black">
        Search
        <input
          className="min-h-11 border border-black/20 bg-white px-3 [font-family:var(--font-editorial-sans)] text-sm font-normal normal-case text-black outline-none transition focus:border-black"
          onChange={(event) => updateFilter("q", event.target.value)}
          placeholder="Search articles"
          type="search"
          value={query}
        />
      </label>
      <label className="flex flex-col gap-2 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase text-black">
        Category
        <select
          className="min-h-11 border border-black/20 bg-white px-3 [font-family:var(--font-editorial-sans)] text-sm font-normal normal-case text-black outline-none transition focus:border-black"
          disabled={categoryLocked}
          onChange={(event) => updateFilter("category", event.target.value)}
          value={category}
        >
          <option value="all">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase text-black">
        Tag
        <select
          className="min-h-11 border border-black/20 bg-white px-3 [font-family:var(--font-editorial-sans)] text-sm font-normal normal-case text-black outline-none transition focus:border-black"
          onChange={(event) => updateFilter("tag", event.target.value)}
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
      <label className="flex flex-col gap-2 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase text-black">
        Sort
        <select
          className="min-h-11 border border-black/20 bg-white px-3 [font-family:var(--font-editorial-sans)] text-sm font-normal normal-case text-black outline-none transition focus:border-black"
          onChange={(event) => updateFilter("sort", event.target.value)}
          value={sort}
        >
          <option value="latest">Latest</option>
          <option value="popular">Popular</option>
        </select>
      </label>
      <p className="[font-family:var(--font-editorial-body-sans)] text-sm italic text-black/62">
        {isPending
          ? "Loading..."
          : `${resultCount} ${resultCount === 1 ? "article" : "articles"}`}
      </p>
    </section>
  );
}
