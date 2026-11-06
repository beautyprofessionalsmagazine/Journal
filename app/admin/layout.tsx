import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { hasAdminSession } from "@/features/admin/server/admin-auth";
import { PRIVATE_ROBOTS } from "@/shared/seo/metadata";

// The back office is never a search result. robots.txt keeps crawlers out and
// this tag (plus an X-Robots-Tag header, see next.config.ts) covers any URL a
// crawler reaches anyway.
export const metadata: Metadata = {
  title: { absolute: "Admin" },
  robots: PRIVATE_ROBOTS,
};

type AdminRouteLayoutProps = {
  children: ReactNode;
};

export default async function AdminRouteLayout({
  children,
}: AdminRouteLayoutProps) {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  return children;
}
