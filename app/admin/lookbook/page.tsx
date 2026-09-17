import type { Metadata } from "next";

import { AdminLayout } from "@/features/admin";
import { LookbookAdminPage, getLookbooks } from "@/features/lookbook";

export const metadata: Metadata = { title: "Manage Lookbook" };
export const dynamic = "force-dynamic";

export default async function AdminLookbookRoute() {
  const lookbooks = await getLookbooks();

  return (
    <AdminLayout
      description="Publish and maintain the year-by-year, month-by-month Lookbook archive."
      title="Lookbook"
    >
      <LookbookAdminPage initialLookbooks={lookbooks} />
    </AdminLayout>
  );
}
