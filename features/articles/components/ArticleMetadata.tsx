import type { Article } from "@/features/articles/types/article";
import { getArticleDates } from "@/features/articles/lib/article-dates";
import { getAuthorName } from "@/shared/seo/text";

type ArticleMetadataProps = {
  article: Article;
  includeCredits?: boolean;
};

export function ArticleMetadata({
  article,
  includeCredits = false,
}: ArticleMetadataProps) {
  const authorName = getAuthorName(article.author) || article.author;
  const dates = getArticleDates(article);

  return (
    <div className="flex flex-col gap-1 [font-family:var(--font-editorial-body-sans)] text-sm italic leading-6 text-black/62 sm:flex-row sm:flex-wrap sm:gap-x-4">
      <span>By {authorName}</span>
      <span>
        Published{" "}
        <time dateTime={dates.published.toISOString()}>
          {formatArticleDate(dates.published)}
        </time>
      </span>
      {dates.modified ? (
        <span>
          Updated{" "}
          <time dateTime={dates.modified.toISOString()}>
            {formatArticleDate(dates.modified)}
          </time>
        </span>
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
