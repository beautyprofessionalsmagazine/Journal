import { AdminArticleForm, AdminLayout } from "@/features/admin";

export default function NewArticlePage() {
  return (
    <AdminLayout
      description="Create a draft article in the local UI. Saving validates the form until persistence is connected."
      title="New Article"
    >
      <AdminArticleForm />
    </AdminLayout>
  );
}
