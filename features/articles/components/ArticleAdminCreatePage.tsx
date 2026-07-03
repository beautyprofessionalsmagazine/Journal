import { AdminLayout } from "@/features/admin";
import { ArticleCreateForm } from "@/features/articles/components/ArticleCreateForm";

export function ArticleAdminCreatePage() {
  return (
    <AdminLayout
      description="Create an article record, write the story in Tiptap, and upload an optional cover image to Vercel Blob."
      title="Create Article"
    >
      <ArticleCreateForm />
    </AdminLayout>
  );
}
