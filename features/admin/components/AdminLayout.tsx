import Link from "next/link";
import type { ReactNode } from "react";

import { logoutAdminAction } from "@/features/admin/server/admin-auth-actions";

type AdminLayoutProps = {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
};

const adminNavigation = [
  { label: "Overview", href: "/admin" },
  { label: "Articles", href: "/admin/articles" },
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
        <aside className="border-b border-black bg-white px-4 py-4 sm:px-6 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:p-7">
          <div className="flex flex-col gap-5 lg:h-full lg:gap-8">
            <Link
              className="focus-ring max-w-[12ch] [font-family:var(--font-editorial-title)] text-[clamp(1.8rem,7vw,2.5rem)] font-bold leading-[0.88] tracking-[-0.035em]"
              href="/"
            >
              Beauty Professionals Magazine
            </Link>
            <nav aria-label="Admin navigation">
              <ul className="grid grid-cols-3 divide-x divide-black border-y border-black lg:grid-cols-1 lg:divide-x-0 lg:divide-y">
                {adminNavigation.map((item) => (
                  <li key={item.href}>
                    <Link
                      className="focus-ring flex min-h-12 items-center justify-center px-2 text-center [font-family:var(--font-editorial-sans)] text-[0.68rem] font-semibold uppercase tracking-[0.06em] transition-colors hover:bg-black hover:text-white lg:justify-start lg:px-3"
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <form action={logoutAdminAction} className="lg:mt-auto">
              <button
                className="focus-ring flex min-h-12 w-full items-center justify-center border border-black/20 px-4 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase tracking-[0.06em] transition-colors hover:border-black hover:bg-black hover:text-white lg:justify-start"
                type="submit"
              >
                Log out
              </button>
            </form>
          </div>
        </aside>
        <section className="flex min-w-0 flex-col" id="admin-content">
          <header className="border-b border-black px-[var(--page-padding)] py-[clamp(2rem,5vw,4.5rem)]">
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
