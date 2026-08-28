"use client";

import { ChevronDown, Menu, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { Button, ButtonLink } from "@/shared/components/ui";
import { mainNavigation } from "@/shared/config/navigation";

/* Intrinsic size of the trimmed wordmark, kept so the aspect ratio is locked. */
const LOGO_WIDTH = 1200;
const LOGO_HEIGHT = 361;

/*
 * The shared buttons are drawn for black-on-white surfaces. The header runs on
 * charcoal, so each control is re-tinted here rather than adding inverse
 * variants that nothing else on the site would use.
 */
const HEADER_OUTLINE_BUTTON =
  "border-white/70 text-white hover:border-white hover:bg-white hover:text-black";
const HEADER_ICON_BUTTON =
  "border-white/35 text-white hover:border-white hover:bg-white hover:text-black";
const HEADER_TEXT_BUTTON =
  "text-white hover:border-white/25 hover:bg-white/10";

export function SiteHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        openDropdown &&
        event.target instanceof Node &&
        !headerRef.current?.contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenDropdown(null);
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openDropdown]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  function toggleDropdown(name: string) {
    setOpenDropdown((current) => (current === name ? null : name));
  }

  function handleHeaderClick(event: ReactMouseEvent<HTMLElement>) {
    if (
      event.target instanceof Element &&
      event.target.closest("a[href]")
    ) {
      setIsMenuOpen(false);
      setOpenDropdown(null);
    }
  }

  return (
    <header
      className="site-header-surface sticky top-0 z-40 border-b border-black"
      onClick={handleHeaderClick}
      ref={headerRef}
    >
      <div className="site-container">
        <div className="grid min-h-[5.25rem] grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-3 lg:min-h-[8.25rem] lg:grid-cols-[15rem_minmax(0,1fr)_15rem]">
          <Button
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className={`lg:hidden ${HEADER_TEXT_BUTTON}`}
            onClick={() => setIsMenuOpen((current) => !current)}
            size="icon"
            variant="text"
          >
            {isMenuOpen ? (
              <X aria-hidden="true" size={22} strokeWidth={1.5} />
            ) : (
              <Menu aria-hidden="true" size={23} strokeWidth={1.5} />
            )}
          </Button>

          <div className="hidden items-center gap-5 lg:flex">
            <Link
              aria-current={
                isRouteActive(pathname, "/current-issue")
                  ? "page"
                  : undefined
              }
              className="focus-ring link-transition inline-flex min-h-11 items-center [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase tracking-[0.08em] text-white/85 hover:text-white"
              href="/current-issue"
            >
              Current Issue
            </Link>
            <Link
              aria-current={
                isRouteActive(pathname, "/where-to-find") ? "page" : undefined
              }
              className="focus-ring link-transition inline-flex min-h-11 items-center [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase tracking-[0.08em] text-white/85 hover:text-white"
              href="/where-to-find"
            >
              Where to Find
            </Link>
          </div>

          <Link
            aria-current={pathname === "/" ? "page" : undefined}
            aria-label="Beauty Professionals Magazine home"
            className="focus-ring link-transition mx-auto flex w-full max-w-[clamp(10rem,21vw,19rem)] items-center justify-center"
            href="/"
          >
            <Image
              alt=""
              className="h-auto w-full object-contain"
              height={LOGO_HEIGHT}
              priority
              sizes="(min-width: 1024px) 304px, 176px"
              src="/images/beauty-professionals-magazine-logo.png"
              width={LOGO_WIDTH}
            />
          </Link>

          <div className="flex items-center justify-end gap-3">
            <div className="hidden lg:block">
              <ButtonLink
                aria-current={
                  isRouteActive(pathname, "/subscribe") ? "page" : undefined
                }
                className={HEADER_OUTLINE_BUTTON}
                href="/subscribe"
                size="sm"
                variant="outline"
              >
                Subscribe
              </ButtonLink>
            </div>
            <ButtonLink
              aria-current={
                isRouteActive(pathname, "/articles")
                  ? "page"
                  : undefined
              }
              aria-label="Search articles"
              className={HEADER_ICON_BUTTON}
              href="/articles"
              variant="icon"
            >
              <Search aria-hidden="true" size={20} strokeWidth={1.5} />
            </ButtonLink>
          </div>
        </div>

        <nav
          aria-label="Main navigation"
          className="hidden border-t border-white/20 lg:block"
        >
          <ul className="flex min-h-14 items-center justify-center gap-x-[clamp(1rem,2vw,2rem)] [font-family:var(--font-editorial-sans)] text-[0.72rem] font-semibold uppercase tracking-[0.07em]">
            {mainNavigation.map((item) => (
              <li className="relative" key={item.href}>
                {item.subcategories.length > 0 ? (
                  <>
                    <Button
                      aria-current={
                        isRouteActive(pathname, item.href)
                          ? "page"
                          : undefined
                      }
                      aria-controls={`desktop-${item.name}-menu`}
                      aria-expanded={openDropdown === item.name}
                      className={`px-1 ${HEADER_TEXT_BUTTON} ${
                        isRouteActive(pathname, item.href)
                          ? "border-b-white"
                          : ""
                      }`}
                      onClick={() => toggleDropdown(item.name)}
                      variant="text"
                    >
                      {item.name}
                      <ChevronDown
                        aria-hidden="true"
                        className={`transition-transform ${
                          openDropdown === item.name ? "rotate-180" : ""
                        }`}
                        size={13}
                      />
                    </Button>
                    <div
                      className={`absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 border border-white/20 bg-[#141414] p-2 text-white shadow-[0_18px_45px_rgba(0,0,0,0.45)] transition-[opacity,transform] duration-200 ${
                        openDropdown === item.name
                          ? "visible translate-y-0 opacity-100"
                          : "pointer-events-none invisible -translate-y-2 opacity-0"
                      }`}
                      id={`desktop-${item.name}-menu`}
                    >
                      <Link
                        aria-current={
                          isRouteActive(pathname, item.href)
                            ? "page"
                            : undefined
                        }
                        className="focus-ring link-transition block min-h-11 px-3 py-3"
                        href={item.href}
                      >
                        All {item.name}
                      </Link>
                      {item.subcategories.map((subcategory) => (
                        <Link
                          className="focus-ring link-transition block min-h-11 border-t border-white/12 px-3 py-3 font-normal text-white/68 hover:text-white"
                          href={`${item.href}?tag=${encodeURIComponent(subcategory)}`}
                          key={subcategory}
                        >
                          {subcategory}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    aria-current={
                      isRouteActive(pathname, item.href)
                        ? "page"
                        : undefined
                    }
                    className={`focus-ring link-transition inline-flex min-h-11 min-w-11 items-center justify-center border-b ${
                      isRouteActive(pathname, item.href)
                        ? "border-white"
                        : "border-transparent"
                    }`}
                    href={item.href}
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div
        className={`absolute inset-x-0 top-full h-[calc(100dvh-5.25rem)] overflow-y-auto border-t border-white/20 bg-[#121212] text-white transition-[opacity,transform] duration-200 lg:hidden ${
          isMenuOpen
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-2 opacity-0"
        }`}
        id="mobile-navigation"
      >
        <nav
          aria-label="Mobile navigation"
          className="site-container flex min-h-full flex-col py-5"
        >
          <div className="grid grid-cols-3 border-y border-white/22">
            <Link
              aria-current={
                isRouteActive(pathname, "/current-issue")
                  ? "page"
                  : undefined
              }
              className="focus-ring link-transition inline-flex min-h-12 items-center border-r border-white/22 px-3 text-xs font-semibold uppercase tracking-[0.08em] text-white/85 hover:text-white"
              href="/current-issue"
            >
              Current Issue
            </Link>
            <Link
              aria-current={
                isRouteActive(pathname, "/where-to-find") ? "page" : undefined
              }
              className="focus-ring link-transition inline-flex min-h-12 items-center border-r border-white/22 px-3 text-xs font-semibold uppercase tracking-[0.08em] text-white/85 hover:text-white"
              href="/where-to-find"
            >
              Where to Find
            </Link>
            <Link
              aria-current={
                isRouteActive(pathname, "/subscribe") ? "page" : undefined
              }
              className="focus-ring link-transition inline-flex min-h-12 items-center bg-white px-3 text-xs font-semibold uppercase tracking-[0.08em] text-black"
              href="/subscribe"
            >
              Subscribe
            </Link>
          </div>

          <ul className="mt-5 divide-y divide-white/14 border-b border-white/22">
            {mainNavigation.map((item) => (
              <li key={item.href}>
                {item.subcategories.length > 0 ? (
                  <>
                    <Button
                      aria-current={
                        isRouteActive(pathname, item.href)
                          ? "page"
                          : undefined
                      }
                      aria-controls={`mobile-${item.name}-menu`}
                      aria-expanded={openDropdown === item.name}
                      className="min-h-14 w-full justify-between px-0 text-left [font-family:var(--font-editorial-title)] text-2xl font-bold normal-case tracking-[-0.02em] text-white hover:translate-y-0 hover:border-transparent hover:bg-transparent"
                      onClick={() => toggleDropdown(item.name)}
                      variant="text"
                    >
                      {item.name}
                      <ChevronDown
                        aria-hidden="true"
                        className={`transition-transform ${
                          openDropdown === item.name ? "rotate-180" : ""
                        }`}
                        size={18}
                      />
                    </Button>
                    <div
                      className={`overflow-hidden transition-[opacity,transform] duration-200 ${
                        openDropdown === item.name
                          ? "grid translate-y-0 opacity-100"
                          : "hidden -translate-y-1 opacity-0"
                      }`}
                      id={`mobile-${item.name}-menu`}
                    >
                      <div className="min-h-0">
                        <div className="grid grid-cols-2 gap-x-3 border-t border-white/12 pb-3 pt-2">
                          <Link
                            aria-current={
                              isRouteActive(pathname, item.href)
                                ? "page"
                                : undefined
                            }
                            className="focus-ring link-transition col-span-2 flex min-h-11 items-center text-xs font-semibold uppercase tracking-[0.08em]"
                            href={item.href}
                          >
                            View all {item.name}
                          </Link>
                          {item.subcategories.map((subcategory) => (
                            <Link
                              className="focus-ring link-transition flex min-h-11 items-center text-sm text-white/68"
                              href={`${item.href}?tag=${encodeURIComponent(subcategory)}`}
                              key={subcategory}
                            >
                              {subcategory}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    aria-current={
                      isRouteActive(pathname, item.href)
                        ? "page"
                        : undefined
                    }
                    className={`focus-ring link-transition flex min-h-14 items-center [font-family:var(--font-editorial-title)] text-2xl font-bold ${
                      isRouteActive(pathname, item.href)
                        ? "underline decoration-1 underline-offset-4"
                        : ""
                    }`}
                    href={item.href}
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <p className="mt-auto pt-8 [font-family:var(--font-editorial-body-sans)] text-xs italic text-white/50">
            Independent beauty, fashion, and culture reporting.
          </p>
        </nav>
      </div>
    </header>
  );
}

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
