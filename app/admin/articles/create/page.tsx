import { ArticleAdminCreatePage } from "@/features/articles";

// New articles use the same publish-time cover generation pipeline as edits.
export const maxDuration = 60;

export default function CreateArticlePage() {
  return <ArticleAdminCreatePage />;
}
