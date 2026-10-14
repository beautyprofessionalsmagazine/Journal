import type {
  ArticleSort,
  PublishedArticleFilters,
} from "@/features/articles/server/article-queries";

export type ArticlePageSearchParams = Record<
  string,
  string | string[] | undefined
>;

export function parseArticleFilters(
  searchParams: ArticlePageSearchParams,
): PublishedArticleFilters {
  const category = readFilterValue(searchParams.category);
  const tag = readFilterValue(searchParams.tag);
  const query = readValue(searchParams.q);
  const sortValue = readValue(searchParams.sort);
  const sort: ArticleSort = sortValue === "popular" ? "popular" : "latest";

  return {
    category,
    tag,
    query,
    sort,
  };
}

/**
 * Whether the URL asks for a narrowed or re-ordered view of a listing (a
 * search, a tag, a category filter, or the "popular" sort). Those views are
 * subsets or reorderings of the listing they sit on, so they are kept out of
 * the search index, as Google advises for filter and sort variations.
 */
export function hasActiveArticleFilters(
  filters: PublishedArticleFilters,
): boolean {
  return Boolean(
    filters.query || filters.tag || filters.category || filters.sort === "popular",
  );
}

function readFilterValue(value: string | string[] | undefined) {
  const normalized = readValue(value);

  return normalized && normalized !== "all" ? normalized : undefined;
}

function readValue(value: string | string[] | undefined) {
  const firstValue = Array.isArray(value) ? value[0] : value;
  const normalized = firstValue?.trim();

  return normalized || undefined;
}
