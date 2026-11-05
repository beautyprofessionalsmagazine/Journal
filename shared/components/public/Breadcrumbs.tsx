import Link from "next/link";

import type { BreadcrumbItem } from "@/shared/seo/json-ld";

type BreadcrumbsProps = {
  /** Ancestors first. The last item is the current page and is not linked. */
  items: readonly BreadcrumbItem[];
};

/**
 * The visible breadcrumb trail. Pair it with `breadcrumbNode` in the page's
 * JSON-LD so the structured data matches exactly what readers see.
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 text-xs font-semibold uppercase tracking-[0.08em] text-black/62">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li className="flex min-w-0 items-center gap-x-2" key={item.path}>
              {isCurrent ? (
                <span
                  aria-current="page"
                  className="line-clamp-1 max-w-[min(70vw,34rem)] text-black"
                >
                  {item.name}
                </span>
              ) : (
                <>
                  <Link
                    className="focus-ring inline-flex min-h-11 items-center hover:text-black"
                    href={item.path}
                  >
                    {item.name}
                  </Link>
                  <span aria-hidden="true">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
