import type { Metadata } from "next";

import { AdminLayout } from "@/features/admin";
import { LookbookAdminPage } from "@/features/lookbook/components/LookbookAdminPage";
import { getLookbookArchive } from "@/features/lookbook/server/lookbook-queries";

export const metadata: Metadata = { title: "Manage Lookbook" };
export const dynamic = "force-dynamic";

export default async function AdminLookbookRoute() {
  const archive = await getLookbookArchive();

  return (
    <AdminLayout
      description="Publish and maintain the year-by-year, month-by-month Lookbook archive."
      title="Lookbook"
    >
      <LookbookAdminPage
        databaseIssue={
          archive.status === "unavailable"
            ? "unavailable"
            : archive.schema === "legacy"
              ? "migration-required"
              : null
        }
        initialLookbooks={archive.lookbooks}
      />
    </AdminLayout>
  );
}
