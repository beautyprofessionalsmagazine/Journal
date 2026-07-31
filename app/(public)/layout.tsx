import type { ReactNode } from "react";

import { PublicSiteLayout } from "@/shared/components/public";

type PublicLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function PublicLayout({ children }: PublicLayoutProps) {
  return <PublicSiteLayout>{children}</PublicSiteLayout>;
}
