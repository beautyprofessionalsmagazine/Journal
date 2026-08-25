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
      className={`focus-ring flex h-full min-h-12 w-full items-center justify-center whitespace-nowrap px-3 text-center [font-family:var(--font-editorial-sans)] text-[0.68rem] font-semibold uppercase tracking-[0.06em] transition-colors hover:bg-black hover:text-white lg:justify-start ${
        isActive ? "bg-black text-white" : ""
      }`}
      href={href}
    >
      {label}
    </Link>
  );
}
