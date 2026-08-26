import Link from "next/link";

import { ButtonLink } from "@/shared/components/ui";
import { mainNavigation, serviceNavigation } from "@/shared/config/navigation";

export function SiteFooter() {
  return (
    <footer className="border-t border-black bg-white">
      <div className="site-container py-[clamp(3rem,7vw,6.5rem)]">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div className="flex flex-col items-start gap-6">
            <p className="editorial-kicker text-black/52">The Journal</p>
            <Link
              className="focus-ring link-transition max-w-[12ch] [font-family:var(--font-editorial-title)] text-[clamp(2.8rem,6vw,6rem)] font-bold leading-[0.86] tracking-[-0.045em]"
              href="/"
            >
              Beauty Professionals Magazine
            </Link>
            <p className="max-w-lg text-sm leading-7 text-black/62">
              Independent reporting on the people, techniques, ideas, and
              culture shaping beauty work now.
            </p>
            <ButtonLink className="mt-2" href="/subscribe">
              Subscribe to the magazine
            </ButtonLink>
          </div>

          <FooterNavigation
            items={mainNavigation.map(({ name, href }) => ({
              name,
              href,
            }))}
            label="Sections"
          />
          <FooterNavigation
            items={serviceNavigation.map(({ name, slug }) => ({
              name,
              href: `/${slug}`,
            }))}
            label="Information"
          />
        </div>
      </div>

      <div className="border-t border-black/15">
        <div className="site-container flex flex-col gap-2 py-5 [font-family:var(--font-editorial-body-sans)] text-xs italic text-black/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Beauty Professionals Magazine</p>
          <p>Beauty is a practice. The Journal records the work.</p>
        </div>
      </div>
    </footer>
  );
}

type FooterNavigationProps = {
  label: string;
  items: {
    name: string;
    href: string;
  }[];
};

function FooterNavigation({ label, items }: FooterNavigationProps) {
  return (
    <nav aria-label={label}>
      <h2 className="editorial-kicker border-b border-black pb-3">{label}</h2>
      <ul className="mt-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              className="focus-ring link-transition flex min-h-11 items-center border-b border-black/10 text-sm text-black/65 hover:text-black"
              href={item.href}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
