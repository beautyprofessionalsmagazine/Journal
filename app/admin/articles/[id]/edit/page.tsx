import { ArticleAdminDetailPage } from "@/features/articles/components/ArticleAdminDetailPage";

export const dynamic = "force-dynamic";
// Cover publishing downloads the untouched source, renders four derivatives,
// and uploads them before committing the article. Give that bounded work time
// to finish on deployments that still use the shorter function defaults.
export const maxDuration = 60;

type EditArticlePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;
  return <ArticleAdminDetailPage id={id} />;
}
