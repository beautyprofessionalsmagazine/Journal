"use client";

import { ChevronDown, Menu, Search, X } from "lucide-react";
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
      className="sticky top-0 z-40 border-b border-black bg-white"
      onClick={handleHeaderClick}
      ref={headerRef}
    >
      <div className="site-container">
        <div className="grid min-h-[4.75rem] grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-3 lg:min-h-[7rem] lg:grid-cols-[15rem_minmax(0,1fr)_15rem]">
          <Button
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="lg:hidden"
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

          <div className="hidden items-center gap-4 lg:flex">
            <Link
              aria-current={
                isRouteActive(pathname, "/current-issue")
                  ? "page"
                  : undefined
              }
              className="focus-ring link-transition inline-flex min-h-11 items-center [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase tracking-[0.08em]"
              href="/current-issue"
            >
              Current Issue
            </Link>
            <Link
              aria-current={
                isRouteActive(pathname, "/subscribe") ? "page" : undefined
              }
              className="focus-ring link-transition inline-flex min-h-11 items-center [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase tracking-[0.08em]"
              href="/subscribe"
            >
              Subscribe
            </Link>
          </div>

          <Link
            aria-current={pathname === "/" ? "page" : undefined}
            aria-label="Beauty Professionals Magazine home"
            className="focus-ring link-transition mx-auto flex min-h-11 max-w-[13rem] items-center text-center [font-family:var(--font-editorial-title)] text-[clamp(1.45rem,5.8vw,2rem)] font-bold leading-[0.88] tracking-[-0.025em] lg:max-w-none lg:text-[clamp(2.4rem,3.3vw,3.4rem)]"
            href="/"
          >
            Beauty Professionals Magazine
          </Link>

          <div className="flex items-center justify-end gap-4">
            <Link
              aria-current={
                isRouteActive(pathname, "/newsletter")
                  ? "page"
                  : undefined
              }
              className="focus-ring link-transition hidden min-h-11 items-center [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase tracking-[0.08em] lg:inline-flex"
              href="/newsletter"
            >
              Newsletter
            </Link>
            <ButtonLink
              aria-current={
                isRouteActive(pathname, "/articles")
                  ? "page"
                  : undefined
              }
              aria-label="Search articles"
              href="/articles"
              variant="icon"
            >
              <Search aria-hidden="true" size={20} strokeWidth={1.5} />
            </ButtonLink>
          </div>
        </div>

        <nav
          aria-label="Main navigation"
          className="hidden border-t border-black/15 lg:block"
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
                      className={`px-1 ${
                        isRouteActive(pathname, item.href)
                          ? "border-b-black"
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
                      className={`absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 border border-black bg-white p-2 shadow-[0_18px_45px_rgba(0,0,0,0.1)] transition-[opacity,transform] duration-200 ${
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
                          className="focus-ring link-transition block min-h-11 border-t border-black/10 px-3 py-3 font-normal text-black/64 hover:text-black"
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
                        ? "border-black"
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
        className={`absolute inset-x-0 top-full h-[calc(100dvh-4.75rem)] overflow-y-auto border-t border-black bg-white transition-[opacity,transform] duration-200 lg:hidden ${
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
          <div className="grid grid-cols-3 border-y border-black">
            <Link
              aria-current={
                isRouteActive(pathname, "/current-issue")
                  ? "page"
                  : undefined
              }
              className="focus-ring link-transition inline-flex min-h-12 items-center border-r border-black px-3 text-xs font-semibold uppercase tracking-[0.08em]"
              href="/current-issue"
            >
              Current Issue
            </Link>
            <Link
              aria-current={
                isRouteActive(pathname, "/subscribe") ? "page" : undefined
              }
              className="focus-ring link-transition inline-flex min-h-12 items-center border-r border-black px-3 text-xs font-semibold uppercase tracking-[0.08em]"
              href="/subscribe"
            >
              Subscribe
            </Link>
            <Link
              aria-current={
                isRouteActive(pathname, "/newsletter")
                  ? "page"
                  : undefined
              }
              className="focus-ring link-transition inline-flex min-h-12 items-center px-3 text-xs font-semibold uppercase tracking-[0.08em]"
              href="/newsletter"
            >
              Newsletter
            </Link>
          </div>

          <ul className="mt-5 divide-y divide-black/12 border-b border-black">
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
                      className="min-h-14 w-full justify-between px-0 text-left [font-family:var(--font-editorial-title)] text-2xl font-bold normal-case tracking-[-0.02em] hover:translate-y-0 hover:border-transparent hover:bg-transparent"
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
                        <div className="grid grid-cols-2 gap-x-3 border-t border-black/10 pb-3 pt-2">
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
                              className="focus-ring link-transition flex min-h-11 items-center text-sm text-black/65"
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

          <p className="mt-auto pt-8 [font-family:var(--font-editorial-body-sans)] text-xs italic text-black/48">
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
