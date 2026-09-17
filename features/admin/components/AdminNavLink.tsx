"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpenText,
  FileText,
  LayoutDashboard,
  MapPinned,
  type LucideIcon,
  UsersRound,
} from "lucide-react";

type AdminNavLinkProps = {
  href: string;
  label: string;
};

export function AdminNavLink({ href, label }: AdminNavLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href ||
    (href !== "/admin" && pathname.startsWith(`${href}/`));
  const Icon = adminNavIcons[label] ?? FileText;

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={`focus-ring flex h-full min-h-12 w-full items-center justify-center gap-2.5 whitespace-nowrap px-3 text-center [font-family:var(--font-editorial-sans)] text-xs font-semibold tracking-[0.02em] transition-colors hover:bg-white/10 hover:text-white lg:justify-start lg:px-4 ${
        isActive ? "bg-white/12 text-white" : "text-white/66"
      }`}
      href={href}
    >
      <Icon aria-hidden="true" size={16} strokeWidth={1.6} />
      {label}
    </Link>
  );
}

const adminNavIcons: Record<string, LucideIcon> = {
  Overview: LayoutDashboard,
  Articles: FileText,
  Lookbook: BookOpenText,
  Subscriptions: UsersRound,
  Distributors: MapPinned,
  Analytics: BarChart3,
};
