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
  editorial?: boolean;
};

export async function ArticleExplorer({
  excludeId,
  filters = {},
  fixedCategory,
  title = "Latest Articles",
  editorial = false,
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
    <section className="flex flex-col gap-[clamp(2rem,4vw,3.5rem)]">
      <div className="flex flex-col gap-4 border-b border-black pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="editorial-kicker mb-2 text-black/45">The edit</p>
          <h2 className="section-title">
          {title}
          </h2>
        </div>
        <p className="max-w-lg [font-family:var(--font-editorial-sans)] text-sm leading-6 text-black/62">
          Search by title, description, author, tags, or category.
        </p>
      </div>
      <ArticleFilters
        categories={categories}
        category={selectedCategory ?? "all"}
        categoryLocked={Boolean(fixedCategory)}
        key={`${filters.query ?? ""}:${selectedCategory ?? ""}:${filters.tag ?? ""}:${filters.sort ?? ""}`}
        query={filters.query ?? ""}
        resultCount={articles.length}
        sort={filters.sort ?? "latest"}
        tag={filters.tag ?? "all"}
        tags={tags}
      />
      <div aria-live="polite" id="article-results">
        <ArticleGrid articles={articles} editorial={editorial} />
      </div>
    </section>
  );
}
