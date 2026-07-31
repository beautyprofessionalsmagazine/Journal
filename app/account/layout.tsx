import type { ReactNode } from "react";

import { PublicSiteLayout } from "@/shared/components/public";

type AccountLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function AccountLayout({ children }: AccountLayoutProps) {
  return <PublicSiteLayout>{children}</PublicSiteLayout>;
}
