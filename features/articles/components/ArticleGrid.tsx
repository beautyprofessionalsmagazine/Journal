import { ArticleCard } from "@/features/articles/components/ArticleCard";
import type { Article } from "@/features/articles/types/article";

type ArticleGridProps = {
  articles: Article[];
  emptyTitle?: string;
  emptyDescription?: string;
};

export function ArticleGrid({
  articles,
  emptyTitle = "No articles found",
  emptyDescription = "Try a different search term, category, or tag.",
}: ArticleGridProps) {
  if (articles.length === 0) {
    return (
      <div className="border-y border-black/15 py-16 text-center">
        <h3 className="[font-family:var(--font-editorial-title)] text-3xl font-bold text-black">
          {emptyTitle}
        </h3>
        <p className="mx-auto mt-3 max-w-xl [font-family:var(--font-editorial-sans)] text-sm leading-6 text-black/62">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard article={article} key={article.id} />
      ))}
    </div>
  );
}
