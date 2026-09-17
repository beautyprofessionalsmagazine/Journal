import Link from "next/link";
import type { ReactNode } from "react";

import { AdminNavLink } from "@/features/admin/components/AdminNavLink";
import { logoutAdminAction } from "@/features/admin/server/admin-auth-actions";
import { Button } from "@/shared/components/ui";

type AdminLayoutProps = {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
};

const adminNavigation = [
  { label: "Overview", href: "/admin" },
  { label: "Articles", href: "/admin/articles" },
  { label: "Lookbook", href: "/admin/lookbook" },
  { label: "Subscriptions", href: "/admin/subscriptions" },
  { label: "Distributors", href: "/admin/distributors" },
  { label: "Analytics", href: "/admin/analytics" },
];

export function AdminLayout({
  title,
  description,
  action,
  children,
}: AdminLayoutProps) {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#f2f3f3] text-black">
      <a
        className="fixed left-4 top-4 z-[100] -translate-y-24 bg-black px-4 py-3 text-sm font-semibold text-white transition-transform focus:translate-y-0"
        href="#admin-content"
      >
        Skip to admin content
      </a>
      <div className="grid min-h-screen lg:grid-cols-[16.5rem_minmax(0,1fr)]">
        <aside className="min-w-0 bg-[linear-gradient(145deg,#0a0c0d,#181d20)] px-4 py-4 text-white sm:px-6 lg:sticky lg:top-0 lg:h-screen lg:p-3">
          <div className="flex min-w-0 flex-col gap-5 lg:h-[calc(100vh-1.5rem)] lg:rounded-[0.55rem] lg:border lg:border-white/10 lg:p-4">
            <Link
              className="focus-ring max-w-[13ch] [font-family:var(--font-editorial-title)] text-[clamp(1.8rem,7vw,2.3rem)] font-bold leading-[0.86] tracking-[-0.035em] text-[var(--champagne)]"
              href="/"
            >
              Beauty Professionals Magazine
            </Link>
            <p className="hidden border-t border-white/12 pt-4 text-xs text-white/52 lg:block">
              Editorial administration
            </p>
            <nav aria-label="Admin navigation" className="min-w-0">
              <ul className="flex min-w-0 gap-1 overflow-x-auto border-y border-white/12 py-2 lg:flex-col lg:overflow-visible lg:border-0 lg:py-0">
                {adminNavigation.map((item) => (
                  <li className="shrink-0 lg:shrink" key={item.href}>
                    <AdminNavLink
                      href={item.href}
                      label={item.label}
                    />
                  </li>
                ))}
              </ul>
            </nav>
            <form action={logoutAdminAction} className="lg:mt-auto">
              <Button
                className="w-full border-white/20 bg-transparent text-white hover:border-white hover:bg-white hover:text-black lg:justify-start"
                size="lg"
                type="submit"
                variant="secondary"
              >
                Log out
              </Button>
            </form>
          </div>
        </aside>
        <section className="flex min-w-0 flex-col" id="admin-content">
          <header
            className="border-b border-black/10 bg-white px-[var(--page-padding)] py-[clamp(1.75rem,4vw,3rem)]"
            data-reveal
            suppressHydrationWarning
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="flex max-w-3xl flex-col gap-2">
                <p className="editorial-kicker text-black/45">
                  Editorial administration
                </p>
                <h1 className="[overflow-wrap:anywhere] [font-family:var(--font-editorial-title)] text-[clamp(2.7rem,5vw,4.7rem)] font-bold leading-[0.9] tracking-[-0.045em]">
                  {title}
                </h1>
                <p className="[font-family:var(--font-editorial-sans)] text-sm leading-6 text-black/62">
                  {description}
                </p>
              </div>
              {action}
            </div>
          </header>
          <div className="min-w-0 flex-1 px-[var(--page-padding)] py-[clamp(1.5rem,3vw,2.5rem)]">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
