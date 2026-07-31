import { ArticleCard } from "@/features/articles/components/ArticleCard";
import type { Article } from "@/features/articles/types/article";

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
      <div className="reveal border-y border-black py-[clamp(3.5rem,8vw,7rem)] text-center">
        <p className="editorial-kicker text-black/45">Nothing matched</p>
        <h3 className="mx-auto mt-3 max-w-xl [font-family:var(--font-editorial-title)] text-[clamp(2rem,6vw,3.5rem)] font-bold leading-none text-black">
          {emptyTitle}
        </h3>
        <p className="mx-auto mt-3 max-w-xl [font-family:var(--font-editorial-sans)] text-sm leading-6 text-black/62">
          {emptyDescription}
        </p>
      </div>
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
