import { ArticleAdminDetailPage } from "@/features/articles/components/ArticleAdminDetailPage";

export const dynamic = "force-dynamic";

type EditArticlePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;
  return <ArticleAdminDetailPage id={id} />;
}
