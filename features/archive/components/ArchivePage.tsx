import { ArticleGrid } from "@/features/articles/components/ArticleGrid";
import { listPublishedArticles } from "@/features/articles/server/article-queries";
import { PublicInfoPage } from "@/shared/components/public";

export async function ArchivePage() {
  const articles = await listPublishedArticles();

  return (
    <PublicInfoPage
      description="A chronological archive of published Beauty Professionals Magazine stories."
      title="Archive"
    >
      <ArticleGrid articles={articles} />
    </PublicInfoPage>
  );
}
