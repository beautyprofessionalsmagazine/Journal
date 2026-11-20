export const articleViewModeValues = ["actual", "manual"] as const;
export type ArticleViewMode = (typeof articleViewModeValues)[number];
export const MAX_ARTICLE_VIEWS = Number.MAX_SAFE_INTEGER;

export function getDisplayedArticleViews(article: {
  views: number;
  manualViews: number;
  viewCountMode: ArticleViewMode;
}) {
  return article.viewCountMode === "manual"
    ? article.manualViews
    : article.views;
}
