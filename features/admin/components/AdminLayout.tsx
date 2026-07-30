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
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-black bg-white p-5 lg:border-b-0 lg:border-r lg:p-7">
          <div className="flex flex-col gap-8">
            <Link
              className="[font-family:var(--font-editorial-title)] text-3xl font-bold leading-none"
              href="/"
            >
              Beauty Professionals Magazine
            </Link>
            <nav aria-label="Admin navigation">
              <ul className="flex flex-wrap gap-3 lg:flex-col">
                {adminNavigation.map((item) => (
                  <li key={item.href}>
                    <Link
                      className="block border border-black/15 px-4 py-3 [font-family:var(--font-editorial-sans)] text-sm font-semibold uppercase transition hover:border-black hover:bg-black hover:text-white"
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <form action={logoutAdminAction}>
              <button
                className="w-full border border-black/15 px-4 py-3 text-left [font-family:var(--font-editorial-sans)] text-sm font-semibold uppercase transition hover:border-black hover:bg-black hover:text-white"
                type="submit"
              >
                Log out
              </button>
            </form>
          </div>
        </aside>
        <section className="flex flex-col">
          <header className="border-b border-black px-5 py-7 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="flex max-w-3xl flex-col gap-2">
                <h1 className="[font-family:var(--font-editorial-title)] text-5xl font-bold leading-none sm:text-6xl">
                  {title}
                </h1>
                <p className="[font-family:var(--font-editorial-sans)] text-sm leading-6 text-black/62">
                  {description}
                </p>
              </div>
              {action}
            </div>
          </header>
          <div className="flex-1 px-5 py-8 sm:px-8 lg:px-10">{children}</div>
        </section>
      </div>
    </main>
  );
}
