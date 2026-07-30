import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { hasAdminSession } from "@/features/admin/server/admin-auth";

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
