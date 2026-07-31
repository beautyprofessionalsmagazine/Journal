import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminLayout } from "@/features/admin";
import { ArticleEditorForm } from "@/features/articles/components/ArticleEditorForm";
import { getArticleById } from "@/features/articles/server/article-queries";

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
            <Link
              className="inline-flex min-h-11 items-center justify-center border border-black/20 px-4 text-xs font-semibold uppercase transition hover:border-black"
              href={`/articles/${article.slug}`}
            >
              View live
            </Link>
          ) : null}
          <Link
            className="inline-flex min-h-11 items-center justify-center border border-black bg-black px-4 text-xs font-semibold uppercase text-white transition hover:bg-white hover:text-black"
            href="/admin/articles/create"
          >
            New article
          </Link>
        </div>
      }
      description="Edit the canonical article record, rich-text body, cover, and publishing settings."
      title="Edit Article"
    >
      <ArticleEditorForm article={article} />
    </AdminLayout>
  );
}
