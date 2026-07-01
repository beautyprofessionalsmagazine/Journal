import Link from "next/link";
import { Search } from "lucide-react";

import { mainNavigation } from "@/shared/config/navigation";

export function SiteHeader() {
  return (
    <header className="border-b border-black bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-5 sm:px-8 lg:px-12">
        <div className="grid gap-4 lg:grid-cols-[160px_minmax(0,1fr)_160px] lg:items-center">
          <Link
            className="[font-family:var(--font-editorial-sans)] text-sm font-semibold uppercase text-black"
            href="/current-issue"
          >
            Current Issue
          </Link>
          <Link
            className="mobile-text-lock mx-auto block break-words text-center [font-family:var(--font-editorial-title)] text-2xl font-bold leading-none text-black sm:text-5xl lg:text-5xl"
            href="/"
          >
            <span className="block sm:inline">Beauty Professionals</span>{" "}
            <span className="block sm:inline">Magazine</span>
          </Link>
          <div className="flex items-center gap-4 lg:justify-end">
            <Link
              className="[font-family:var(--font-editorial-sans)] text-sm font-semibold uppercase text-black"
              href="/newsletter"
            >
              Newsletter
            </Link>
            <Link
              aria-label="Search articles"
              className="inline-flex size-10 items-center justify-center border border-black text-black transition hover:bg-black hover:text-white"
              href="/articles"
            >
              <Search aria-hidden="true" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
        <nav aria-label="Main navigation" className="border-t border-black/15 pt-4">
          <ul className="mobile-text-lock flex flex-wrap gap-x-4 gap-y-3 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase text-black sm:text-sm">
            {mainNavigation.map((item) => (
              <li className="relative" key={item.slug}>
                {item.subcategories.length > 0 ? (
                  <details className="group">
                    <summary className="cursor-pointer list-none">
                      <span>{item.name}</span>
                    </summary>
                    <div className="z-10 mt-3 min-w-56 border border-black bg-white p-3 shadow-[0_18px_50px_rgba(0,0,0,0.08)] lg:absolute">
                      <Link className="block py-2" href={`/${item.slug}`}>
                        All {item.name}
                      </Link>
                      {item.subcategories.map((subcategory) => (
                        <span
                          className="block py-2 text-xs font-normal uppercase text-black/65"
                          key={subcategory}
                        >
                          {subcategory}
                        </span>
                      ))}
                    </div>
                  </details>
                ) : (
                  <Link href={`/${item.slug}`}>{item.name}</Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
