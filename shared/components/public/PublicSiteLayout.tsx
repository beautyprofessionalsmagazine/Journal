import type { ReactNode } from "react";

import { SiteFooter } from "@/shared/components/public/SiteFooter";
import { SiteHeader } from "@/shared/components/public/SiteHeader";

type PublicSiteLayoutProps = {
  children: ReactNode;
};

export function PublicSiteLayout({ children }: PublicSiteLayoutProps) {
  return (
    <div className="site-shell min-h-screen text-black">
      <a
        className="fixed left-4 top-4 z-[100] -translate-y-24 bg-black px-4 py-3 text-sm font-semibold text-white transition-transform focus:translate-y-0"
        href="#main-content"
      >
        Skip to content
      </a>
      <SiteHeader />
      <div id="main-content" tabIndex={-1}>
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}
