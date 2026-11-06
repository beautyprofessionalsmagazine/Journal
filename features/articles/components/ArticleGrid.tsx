import { ArticleCard } from "@/features/articles/components/ArticleCard";
import type { Article } from "@/features/articles/types/article";
import { EmptyState } from "@/shared/components/ui";

type ArticleGridProps = {
  articles: Article[];
  emptyTitle?: string;
  emptyDescription?: string;
  editorial?: boolean;
  /**
   * Load the first card's image eagerly and ahead of other images. Right for
   * a listing, where that card is the first thing on screen; wrong for a grid
   * far below the fold (related stories), where it would compete with the
   * page's own hero image.
   */
  prioritizeFirst?: boolean;
};

export function ArticleGrid({
  articles,
  emptyTitle = "No articles found",
  emptyDescription = "Try a different search term, category, or tag.",
  editorial = false,
  prioritizeFirst = true,
}: ArticleGridProps) {
  if (articles.length === 0) {
    return (
      <EmptyState description={emptyDescription} title={emptyTitle} />
    );
  }

  return (
    <div
      className={`grid gap-x-[clamp(1.5rem,3vw,3.5rem)] gap-y-[clamp(3rem,6vw,6rem)] md:grid-cols-2 xl:grid-cols-3 ${
        editorial ? "items-start" : ""
      }`}
    >
      {articles.map((article, index) => (
        <ArticleCard
          article={article}
          key={article.id}
          priority={prioritizeFirst && index === 0}
          variant={
            editorial && index === 0
              ? "primary"
              : editorial && index > 4
                ? "compact"
                : "standard"
          }
        />
      ))}
    </div>
  );
}
