import { AdminLayout } from "@/features/admin";
import { ArticleEditorForm } from "@/features/articles/components/ArticleEditorForm";
import { ButtonLink } from "@/shared/components/ui";

export function ArticleAdminCreatePage() {
  return (
    <AdminLayout
      action={
        <ButtonLink href="/admin/articles" variant="secondary">
          Back to articles
        </ButtonLink>
      }
      description="Shape the story, prepare its cover, and choose when it enters the Journal."
      title="Create Article"
    >
      <ArticleEditorForm />
    </AdminLayout>
  );
}
