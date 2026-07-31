"use client";

import { Filter, RotateCcw, Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";

import { Button, Select } from "@/shared/components/ui";

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
        <Button
          aria-controls="article-filter-controls"
          aria-expanded={isOpen}
          className="px-0 lg:hidden"
          onClick={() => setIsOpen((current) => !current)}
          variant="text"
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
        </Button>

        <p className="[font-family:var(--font-editorial-body-sans)] text-sm italic text-black/58">
          {isPending
            ? "Updating…"
            : `${resultCount} ${resultCount === 1 ? "article" : "articles"}`}
        </p>

        {activeCount > 0 ? (
          <Button
            className="hidden px-0 lg:inline-flex"
            onClick={resetFilters}
            variant="text"
          >
            <RotateCcw aria-hidden="true" size={15} />
            Reset
          </Button>
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
                <Button
                  aria-label="Search articles"
                  className="size-12 min-h-12"
                  isLoading={isPending}
                  loadingLabel=""
                  size="icon"
                  type="submit"
                >
                  <Search aria-hidden="true" size={18} />
                </Button>
              </div>
            </form>

            <Select
              disabled={categoryLocked}
              label="Category"
              onChange={(value) => navigateWithUpdates({ category: value })}
              options={[
                { label: "All categories", value: "all" },
                ...categories.map((item) => ({
                  label: item,
                  value: item,
                })),
              ]}
              value={category}
            />
            <Select
              label="Tag"
              onChange={(value) => navigateWithUpdates({ tag: value })}
              options={[
                { label: "All tags", value: "all" },
                ...tags.map((item) => ({
                  label: item,
                  value: item,
                })),
              ]}
              value={tag}
            />
            <Select
              label="Sort"
              onChange={(value) => navigateWithUpdates({ sort: value })}
              options={[
                { label: "Latest", value: "latest" },
                { label: "Popular", value: "popular" },
              ]}
              value={sort}
            />

            {activeCount > 0 ? (
              <Button
                className="lg:hidden"
                onClick={resetFilters}
                variant="secondary"
              >
                <RotateCcw aria-hidden="true" size={15} />
                Reset all
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
