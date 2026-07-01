import type { ReactNode } from "react";

import { SiteFooter } from "@/shared/components/SiteFooter";
import { SiteHeader } from "@/shared/components/SiteHeader";

type PublicLayoutProps = {
  children: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="site-shell min-h-screen text-black">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
