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
  { label: "Subscriptions", href: "/admin/subscriptions" },
  { label: "Analytics", href: "/admin/analytics" },
];

export function AdminLayout({
  title,
  description,
  action,
  children,
}: AdminLayoutProps) {
  return (
    <main className="min-h-screen bg-white text-black">
      <a
        className="fixed left-4 top-4 z-[100] -translate-y-24 bg-black px-4 py-3 text-sm font-semibold text-white transition-transform focus:translate-y-0"
        href="#admin-content"
      >
        Skip to admin content
      </a>
      <div className="grid min-h-screen lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="min-w-0 border-b border-black bg-white px-4 py-4 sm:px-6 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:p-7">
          <div className="flex min-w-0 flex-col gap-5 lg:h-full lg:gap-8">
            <Link
              className="focus-ring max-w-[12ch] [font-family:var(--font-editorial-title)] text-[clamp(1.8rem,7vw,2.5rem)] font-bold leading-[0.88] tracking-[-0.035em]"
              href="/"
            >
              Beauty Professionals Magazine
            </Link>
            <nav aria-label="Admin navigation" className="min-w-0">
              <ul className="flex min-w-0 divide-x divide-black overflow-x-auto border-y border-black [scrollbar-width:none] lg:flex-col lg:divide-x-0 lg:divide-y lg:overflow-visible">
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
                className="w-full lg:justify-start"
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
            className="border-b border-black px-[var(--page-padding)] py-[clamp(2rem,5vw,4.5rem)]"
            data-reveal
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="flex max-w-3xl flex-col gap-2">
                <p className="editorial-kicker text-black/45">
                  Editorial administration
                </p>
                <h1 className="[overflow-wrap:anywhere] [font-family:var(--font-editorial-title)] text-[clamp(3rem,7vw,6rem)] font-bold leading-[0.9] tracking-[-0.045em]">
                  {title}
                </h1>
                <p className="[font-family:var(--font-editorial-sans)] text-sm leading-6 text-black/62">
                  {description}
                </p>
              </div>
              {action}
            </div>
          </header>
          <div className="min-w-0 flex-1 px-[var(--page-padding)] py-[clamp(2rem,4vw,3.5rem)]">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
