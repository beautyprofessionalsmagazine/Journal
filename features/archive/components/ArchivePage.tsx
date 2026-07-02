import { ArticleGrid } from "@/features/articles/components/ArticleGrid";
import { getPublishedArticles } from "@/features/articles/server/articles";
import { PublicInfoPage } from "@/shared/components/public";

export function ArchivePage() {
  return (
    <PublicInfoPage
      description="A chronological archive of published Beauty Professionals Magazine stories."
      title="Archive"
    >
      <ArticleGrid articles={getPublishedArticles()} />
    </PublicInfoPage>
  );
}
