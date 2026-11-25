import type { Article } from "@/features/articles/types/article";
import { ArticleViewCount } from "@/features/articles/components/ArticleViews";
import { getDisplayedArticleViews } from "@/features/articles/lib/article-views";
import { getArticleDates } from "@/features/articles/lib/article-dates";
import { SITE } from "@/shared/seo/site";
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
      <span>By {authorName} | ISSN {SITE.issn}</span>
      <span>
        Published{" "}
        <time dateTime={dates.published.toISOString()}>
          {formatArticleDate(dates.published)}
        </time>
      </span>
      {includeCredits ? (
        <ArticleViewCount initialViews={getDisplayedArticleViews(article)} />
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
