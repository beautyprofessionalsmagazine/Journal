import { ArticleFilters } from "@/features/articles/components/ArticleFilters";
import { ArticleGrid } from "@/features/articles/components/ArticleGrid";
import {
  getPublishedArticleFilterOptions,
  listPublishedArticles,
  type PublishedArticleFilters,
} from "@/features/articles/server/article-queries";

type ArticleExplorerProps = {
  excludeId?: string;
  filters?: PublishedArticleFilters;
  fixedCategory?: string;
  title?: string;
};

export async function ArticleExplorer({
  excludeId,
  filters = {},
  fixedCategory,
  title = "Latest Articles",
}: ArticleExplorerProps) {
  const effectiveFilters = {
    ...filters,
    category: fixedCategory ?? filters.category,
    excludeId,
  };
  const [articles, options] = await Promise.all([
    listPublishedArticles(effectiveFilters),
    getPublishedArticleFilterOptions(),
  ]);
  const selectedCategory = fixedCategory ?? filters.category;
  const categories =
    selectedCategory && !options.categories.includes(selectedCategory)
      ? [selectedCategory, ...options.categories]
      : options.categories;
  const tags =
    filters.tag && !options.tags.includes(filters.tag)
      ? [filters.tag, ...options.tags]
      : options.tags;

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
        category={selectedCategory ?? "all"}
        categoryLocked={Boolean(fixedCategory)}
        query={filters.query ?? ""}
        resultCount={articles.length}
        sort={filters.sort ?? "latest"}
        tag={filters.tag ?? "all"}
        tags={tags}
      />
      <ArticleGrid articles={articles} />
    </section>
  );
}
