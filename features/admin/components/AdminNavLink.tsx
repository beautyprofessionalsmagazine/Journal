"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminNavLinkProps = {
  href: string;
  label: string;
};

export function AdminNavLink({ href, label }: AdminNavLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href ||
    (href !== "/admin" && pathname.startsWith(`${href}/`));

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={`focus-ring flex min-h-12 items-center justify-center px-2 text-center [font-family:var(--font-editorial-sans)] text-[0.68rem] font-semibold uppercase tracking-[0.06em] transition-colors hover:bg-black hover:text-white lg:justify-start lg:px-3 ${
        isActive ? "bg-black text-white" : ""
      }`}
      href={href}
    >
      {label}
    </Link>
  );
}
