import type { Article } from "@/features/articles/types/article";

type ArticleMetadataProps = {
  article: Article;
  includeCredits?: boolean;
};

export function ArticleMetadata({
  article,
  includeCredits = false,
}: ArticleMetadataProps) {
  return (
    <div className="flex flex-col gap-1 [font-family:var(--font-editorial-body-sans)] text-sm italic leading-6 text-black/62 sm:flex-row sm:flex-wrap sm:gap-x-4">
      <span>By {article.author}</span>
      {article.publishedAt ? (
        <time dateTime={article.publishedAt.toISOString()}>
          {formatArticleDate(article.publishedAt)}
        </time>
      ) : null}
      {includeCredits && article.views > 0 ? (
        <span>{article.views.toLocaleString()} views</span>
      ) : null}
    </div>
  );
}

function formatArticleDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(value);
}
