import type { ReactNode } from "react";

import { SiteFooter } from "@/shared/components/public/SiteFooter";
import { SiteHeader } from "@/shared/components/public/SiteHeader";

type PublicSiteLayoutProps = {
  children: ReactNode;
};

export function PublicSiteLayout({ children }: PublicSiteLayoutProps) {
  return (
    <div className="site-shell min-h-screen text-black">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
