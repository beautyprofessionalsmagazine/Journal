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

function readFilterValue(value: string | string[] | undefined) {
  const normalized = readValue(value);

  return normalized && normalized !== "all" ? normalized : undefined;
}

function readValue(value: string | string[] | undefined) {
  const firstValue = Array.isArray(value) ? value[0] : value;
  const normalized = firstValue?.trim();

  return normalized || undefined;
}
