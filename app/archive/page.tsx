import { ArticleGrid, getPublishedArticles } from "@/features/articles";
import { InfoPage } from "@/shared/components/InfoPage";
import { PublicLayout } from "@/shared/components/PublicLayout";

export default function ArchivePage() {
  const archivedArticles = getPublishedArticles();

  return (
    <PublicLayout>
      <InfoPage
        description="A chronological archive of published Beauty Professionals Magazine stories."
        title="Archive"
      >
        <ArticleGrid articles={archivedArticles} />
      </InfoPage>
    </PublicLayout>
  );
}
