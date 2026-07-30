import Link from "next/link";

import { AdminLayout } from "@/features/admin";
import { ArticleCreateForm } from "@/features/articles/components/ArticleCreateForm";

export function ArticleAdminCreatePage() {
  return (
    <AdminLayout
      action={
        <Link
          className="inline-flex min-h-11 items-center justify-center border border-black/20 px-4 text-xs font-semibold uppercase transition hover:border-black hover:bg-black hover:text-white"
          href="/admin/articles"
        >
          Back to articles
        </Link>
      }
      description="Shape the story, prepare its cover, and choose when it enters the Journal."
      title="Create Article"
    >
      <ArticleCreateForm />
    </AdminLayout>
  );
}
