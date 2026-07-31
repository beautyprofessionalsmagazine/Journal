"use client";

import { Filter, RotateCcw, Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";

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
  const [isOpen, setIsOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(query);
  const activeCount =
    Number(Boolean(query)) +
    Number(!categoryLocked && category !== "all") +
    Number(tag !== "all") +
    Number(sort !== "latest");

  function navigateWithUpdates(updates: Record<string, string | null>) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([name, value]) => {
      const isDefaultValue =
        !value ||
        value === "all" ||
        (name === "sort" && value === "latest");

      if (isDefaultValue) {
        nextSearchParams.delete(name);
      } else {
        nextSearchParams.set(name, value);
      }
    });

    const queryString = nextSearchParams.toString();
    const destination = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.replace(destination, { scroll: false });
    });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigateWithUpdates({ q: searchDraft.trim() });
  }

  function resetFilters() {
    setSearchDraft("");
    navigateWithUpdates({
      q: null,
      category: null,
      tag: null,
      sort: null,
    });
  }

  return (
    <section
      aria-busy={isPending}
      aria-label="Article filters"
      className="border-y border-black"
    >
      <div className="flex min-h-16 items-center justify-between gap-4 py-2">
        <button
          aria-controls="article-filter-controls"
          aria-expanded={isOpen}
          className="focus-ring inline-flex min-h-11 items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] lg:hidden"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          {isOpen ? (
            <X aria-hidden="true" size={17} />
          ) : (
            <Filter aria-hidden="true" size={17} />
          )}
          {isOpen ? "Close filters" : "Filter articles"}
          {activeCount > 0 ? (
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-black text-[0.65rem] text-white">
              {activeCount}
            </span>
          ) : null}
        </button>

        <p className="[font-family:var(--font-editorial-body-sans)] text-sm italic text-black/58">
          {isPending
            ? "Updating…"
            : `${resultCount} ${resultCount === 1 ? "article" : "articles"}`}
        </p>

        {activeCount > 0 ? (
          <button
            className="focus-ring hidden min-h-11 items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] lg:inline-flex"
            onClick={resetFilters}
            type="button"
          >
            <RotateCcw aria-hidden="true" size={15} />
            Reset
          </button>
        ) : (
          <span className="hidden lg:block" />
        )}
      </div>

      <div
        className={`transition-[opacity,transform] duration-200 lg:grid lg:translate-y-0 lg:grid-rows-[1fr] lg:opacity-100 ${
          isOpen
            ? "grid translate-y-0 grid-rows-[1fr] opacity-100"
            : "hidden -translate-y-1 grid-rows-[0fr] opacity-0 lg:grid"
        }`}
        id="article-filter-controls"
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={`grid gap-4 border-t border-black/15 py-5 transition-opacity lg:grid-cols-[minmax(15rem,1.2fr)_repeat(3,minmax(9rem,0.55fr))] lg:items-end ${
              isPending ? "opacity-55" : "opacity-100"
            }`}
          >
            <form className="min-w-0" onSubmit={submitSearch}>
              <label
                className="editorial-kicker block"
                htmlFor="article-search"
              >
                Search
              </label>
              <div className="mt-2 flex">
                <input
                  className="input-control min-w-0 border-r-0"
                  id="article-search"
                  onChange={(event) => setSearchDraft(event.target.value)}
                  placeholder="Title, author, or subject"
                  type="search"
                  value={searchDraft}
                />
                <button
                  aria-label="Search articles"
                  className="focus-ring inline-flex size-12 shrink-0 items-center justify-center border border-black bg-black text-white transition-colors hover:bg-white hover:text-black"
                  type="submit"
                >
                  <Search aria-hidden="true" size={18} />
                </button>
              </div>
            </form>

            <FilterSelect
              disabled={categoryLocked}
              label="Category"
              onChange={(value) => navigateWithUpdates({ category: value })}
              options={categories}
              value={category}
            />
            <FilterSelect
              label="Tag"
              onChange={(value) => navigateWithUpdates({ tag: value })}
              options={tags}
              value={tag}
            />
            <FilterSelect
              label="Sort"
              onChange={(value) => navigateWithUpdates({ sort: value })}
              options={["latest", "popular"]}
              value={sort}
            />

            {activeCount > 0 ? (
              <button
                className="button-secondary gap-2 lg:hidden"
                onClick={resetFilters}
                type="button"
              >
                <RotateCcw aria-hidden="true" size={15} />
                Reset all
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

type FilterSelectProps = {
  disabled?: boolean;
  label: "Category" | "Tag" | "Sort";
  onChange: (value: string) => void;
  options: string[];
  value: string;
};

function FilterSelect({
  disabled = false,
  label,
  onChange,
  options,
  value,
}: FilterSelectProps) {
  const defaultLabel =
    label === "Category"
      ? "All categories"
      : label === "Tag"
        ? "All tags"
        : null;

  return (
    <label className="editorial-kicker flex flex-col gap-2">
      {label}
      <select
        className="input-control appearance-none disabled:cursor-not-allowed disabled:bg-black/[0.04] disabled:text-black/50"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {defaultLabel ? <option value="all">{defaultLabel}</option> : null}
        {options.map((item) => (
          <option key={item} value={item}>
            {label === "Sort"
              ? item.charAt(0).toUpperCase() + item.slice(1)
              : item}
          </option>
        ))}
      </select>
    </label>
  );
}
