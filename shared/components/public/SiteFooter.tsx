import Link from "next/link";

import { mainNavigation, serviceNavigation } from "@/shared/config/navigation";

export function SiteFooter() {
  return (
    <footer className="border-t border-black bg-white">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-12">
        <div className="flex flex-col gap-4">
          <Link
            className="[font-family:var(--font-editorial-title)] text-4xl font-bold leading-none text-black"
            href="/"
          >
            Beauty Professionals Magazine
          </Link>
          <p className="max-w-md [font-family:var(--font-editorial-sans)] text-sm leading-6 text-black/62">
            Editorial interviews, beauty industry insight, culture, shopping,
            and style for professionals and readers.
          </p>
        </div>
        <nav aria-label="Magazine sections">
          <h2 className="mb-4 [font-family:var(--font-editorial-sans)] text-sm font-semibold uppercase text-black">
            Sections
          </h2>
          <ul className="grid gap-2 [font-family:var(--font-editorial-sans)] text-sm text-black/70">
            {mainNavigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Service pages">
          <h2 className="mb-4 [font-family:var(--font-editorial-sans)] text-sm font-semibold uppercase text-black">
            Information
          </h2>
          <ul className="grid gap-2 [font-family:var(--font-editorial-sans)] text-sm text-black/70">
            {serviceNavigation.map((item) => (
              <li key={item.slug}>
                <Link href={`/${item.slug}`}>{item.name}</Link>
              </li>
            ))}
            <li>
              <Link href="/admin">Admin</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-black/15 px-5 py-5 text-center [font-family:var(--font-editorial-body-sans)] text-xs italic text-black/58 sm:px-8 lg:px-12">
        (c) 2026 Beauty Professionals Magazine
      </div>
    </footer>
  );
}
