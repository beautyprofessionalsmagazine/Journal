import type { Metadata } from "next";

import { AdminLayout } from "@/features/admin";
import { LookbookAdminPage, getActiveLookbook } from "@/features/lookbook";

export const metadata: Metadata = { title: "Manage Lookbook" };

export default async function AdminLookbookRoute() {
  const lookbook = await getActiveLookbook();

  return (
    <AdminLayout
      description="Upload, preview, replace, or remove the single PDF shown in the public Lookbook viewer."
      title="Lookbook"
    >
      <LookbookAdminPage initialLookbook={lookbook} />
    </AdminLayout>
  );
}
