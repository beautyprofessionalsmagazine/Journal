"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

import { sponsors } from "@/features/sponsors/data/sponsors";

export function SponsorsStrip() {
  const [activeSponsor, setActiveSponsor] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const paragraphs = panel.querySelectorAll<HTMLElement>("[data-sponsor-copy]");

    gsap.killTweensOf([panel, paragraphs]);
    if (reduceMotion) {
      gsap.set([panel, paragraphs], {
        autoAlpha: 1,
        clearProps: "clipPath,transform,opacity,visibility",
      });
      return;
    }

    gsap.set(panel, { clipPath: "inset(0 0 100% 0)", autoAlpha: 0, y: -10 });
    gsap.set(paragraphs, { autoAlpha: 0, y: 12 });

    requestAnimationFrame(() => {
      const opening = gsap.timeline({ defaults: { ease: "power3.out" } });
      opening.to(panel, {
        clipPath: "inset(0 0 0% 0)",
        autoAlpha: 1,
        y: 0,
        duration: 0.62,
        clearProps: "clipPath,transform,opacity,visibility",
      });
      opening.to(
        paragraphs,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.48,
          ease: "power2.out",
          stagger: 0.055,
          clearProps: "transform,opacity,visibility",
        },
        "-=0.5",
      );
    });
  }, [activeSponsor]);

  const toggleSponsor = (sponsorId: string) => {
    if (activeSponsor !== sponsorId) {
      setActiveSponsor(sponsorId);
      return;
    }

    const panel = panelRef.current;
    if (!panel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActiveSponsor(null);
      return;
    }

    gsap.to(panel, {
      clipPath: "inset(0 0 100% 0)",
      autoAlpha: 0,
      y: -8,
      duration: 0.34,
      ease: "power2.in",
      onComplete: () => setActiveSponsor(null),
    });
  };

  const activeDetails = sponsors.find((sponsor) => sponsor.id === activeSponsor);

  return (
    <aside
      aria-label="Sponsors and partners"
      className="sponsors-strip border-b border-black/15 bg-[#ecebe7]"
      data-motion-managed
      data-motion-sponsors
    >
      <div className="site-container py-2.5 sm:py-3">
        <p className="editorial-kicker text-center text-black/42">
          Our sponsors &amp; partners
        </p>
        <ul className="mx-auto mt-1.5 grid w-full max-w-4xl grid-cols-3 items-center divide-x divide-black/12">
          {sponsors.map((sponsor) => (
            <li
              className="sponsor-item flex min-w-0 items-center justify-center px-3 sm:px-8"
              data-motion-sponsor-item
              data-sponsor={sponsor.id}
              key={sponsor.id}
            >
              <button
                aria-controls={`sponsor-details-${sponsor.id}`}
                aria-expanded={activeSponsor === sponsor.id}
                className="focus-ring group flex w-full items-center justify-center"
                onClick={() => toggleSponsor(sponsor.id)}
                type="button"
              >
                <div className="relative h-8 w-full overflow-hidden sm:h-10">
                  <Image
                    alt={sponsor.name}
                    className="object-contain"
                    fill
                    unoptimized
                    sizes={
                      sponsor.id === "ibpa"
                        ? "(min-width: 640px) 1024px, 512px"
                        : "(min-width: 640px) 512px, 256px"
                    }
                    src={sponsor.logo}
                  />
                </div>
                <span className="sr-only">
                  {activeSponsor === sponsor.id ? "Hide" : "Show"} details for {sponsor.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {activeDetails ? (
          <div
            aria-live="polite"
            className="sponsor-details mx-auto mt-2 max-w-4xl border-t border-black/15 pt-3 sm:mt-3 sm:pt-4"
            id={`sponsor-details-${activeDetails.id}`}
            ref={panelRef}
          >
            <div className="grid gap-3 sm:grid-cols-[minmax(10rem,0.35fr)_minmax(0,1fr)] sm:gap-8">
              <div>
                <p className="editorial-kicker text-black/42">Partner profile</p>
                <h2 className="mt-1 font-[var(--font-editorial-title)] text-xl font-bold leading-none tracking-[-0.03em] sm:text-2xl">
                  {activeDetails.name}
                </h2>
              </div>
              <div className="max-w-3xl font-[var(--font-editorial-body-serif)] text-[1.05rem] leading-[1.45] text-black/76 sm:text-[1.12rem]">
                {activeDetails.description.map((paragraph) => (
                  <p data-sponsor-copy key={paragraph} className="mb-2 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
