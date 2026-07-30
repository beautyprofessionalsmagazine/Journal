"use client";

type ArticleFiltersProps = {
  categories: string[];
  tags: string[];
  query: string;
  category: string;
  tag: string;
  sort: string;
  resultCount: number;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onSortChange: (value: string) => void;
};

export function ArticleFilters({
  categories,
  tags,
  query,
  category,
  tag,
  sort,
  resultCount,
  onQueryChange,
  onCategoryChange,
  onTagChange,
  onSortChange,
}: ArticleFiltersProps) {
  return (
    <section
      aria-label="Article filters"
      className="grid gap-4 border-y border-black/15 py-5 lg:grid-cols-[minmax(240px,1.1fr)_repeat(3,minmax(150px,0.5fr))_auto] lg:items-end"
    >
      <label className="flex flex-col gap-2 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase text-black">
        Search
        <input
          className="min-h-11 border border-black/20 bg-white px-3 [font-family:var(--font-editorial-sans)] text-sm font-normal normal-case text-black outline-none transition focus:border-black"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search articles"
          type="search"
          value={query}
        />
      </label>
      <label className="flex flex-col gap-2 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase text-black">
        Category
        <select
          className="min-h-11 border border-black/20 bg-white px-3 [font-family:var(--font-editorial-sans)] text-sm font-normal normal-case text-black outline-none transition focus:border-black"
          onChange={(event) => onCategoryChange(event.target.value)}
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
          onChange={(event) => onTagChange(event.target.value)}
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
          onChange={(event) => onSortChange(event.target.value)}
          value={sort}
        >
          <option value="latest">Latest</option>
          <option value="popular">Popular</option>
        </select>
      </label>
      <p className="[font-family:var(--font-editorial-body-sans)] text-sm italic text-black/62">
        {resultCount} {resultCount === 1 ? "article" : "articles"}
      </p>
    </section>
  );
}
