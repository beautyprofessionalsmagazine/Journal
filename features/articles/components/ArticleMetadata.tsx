import type { Article } from "@/features/articles/types/article.types";
import { formatArticleDate } from "@/features/articles/lib/articles";

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
      <time dateTime={article.publishedAt}>
        {formatArticleDate(article.publishedAt)}
      </time>
      {includeCredits ? <span>Photography: {article.photographer}</span> : null}
    </div>
  );
}
