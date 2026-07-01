import { notFound } from "next/navigation";

import { AdminArticleForm, AdminLayout } from "@/features/admin";
import { getArticleById } from "@/features/articles";

type EditArticlePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;
  const article = getArticleById(id);

  if (!article) {
    notFound();
  }

  return (
    <AdminLayout
      description="Edit local article fields and run basic validation before connecting a database."
      title="Edit Article"
    >
      <AdminArticleForm article={article} />
    </AdminLayout>
  );
}
