import Link from "next/link";

import { AdminArticleTable, AdminLayout } from "@/features/admin";
import { articles } from "@/features/articles";

export default function AdminArticlesPage() {
  return (
    <AdminLayout
      action={
        <Link
          className="min-w-40 border border-black bg-white px-5 py-3 text-center [font-family:var(--font-editorial-sans)] text-sm font-semibold uppercase text-black transition hover:bg-black hover:text-white"
          href="/admin/articles/new"
        >
          Create Article
        </Link>
      }
      description="Search, filter, publish, unpublish, edit, and remove local seed articles."
      title="Articles"
    >
      <AdminArticleTable articles={articles} />
    </AdminLayout>
  );
}
