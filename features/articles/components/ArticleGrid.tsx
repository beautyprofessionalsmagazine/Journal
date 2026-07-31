import { ArticleCard } from "@/features/articles/components/ArticleCard";
import type { Article } from "@/features/articles/types/article";
import { EmptyState } from "@/shared/components/ui";

type ArticleGridProps = {
  articles: Article[];
  emptyTitle?: string;
  emptyDescription?: string;
  editorial?: boolean;
};

export function ArticleGrid({
  articles,
  emptyTitle = "No articles found",
  emptyDescription = "Try a different search term, category, or tag.",
  editorial = false,
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
          priority={index === 0}
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
