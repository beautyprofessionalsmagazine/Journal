import { notFound } from "next/navigation";

import { AdminLayout } from "@/features/admin";
import { ArticleEditorForm } from "@/features/articles/components/ArticleEditorForm";
import { getArticleById } from "@/features/articles/server/article-queries";
import { ButtonLink } from "@/shared/components/ui";

type ArticleAdminDetailPageProps = {
  id: string;
};

export async function ArticleAdminDetailPage({
  id,
}: ArticleAdminDetailPageProps) {
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  return (
    <AdminLayout
      action={
        <div className="flex flex-wrap gap-3">
          {article.status === "published" ? (
            <ButtonLink
              href={`/articles/${article.slug}`}
              variant="secondary"
            >
              View live
            </ButtonLink>
          ) : null}
          <ButtonLink href="/admin/articles/create">
            New article
          </ButtonLink>
        </div>
      }
      description="Edit the canonical article record, rich-text body, cover, and publishing settings."
      title="Edit Article"
    >
      <ArticleEditorForm article={article} />
    </AdminLayout>
  );
}
