"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

import { sponsors } from "@/features/sponsors/data/sponsors";

export function SponsorsStrip() {
  const [activeSponsor, setActiveSponsor] = useState<string | null>(null);
  const [displayedSponsor, setDisplayedSponsor] = useState<string | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousDisplayedRef = useRef<string | null>(null);
  const switchDirectionRef = useRef(1);

  useLayoutEffect(() => {
    if (!displayedSponsor) return;

    const shell = shellRef.current;
    const panel = panelRef.current;
    if (!shell || !panel) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const paragraphs = panel.querySelectorAll<HTMLElement>("[data-sponsor-copy]");
    const previousDisplayed = previousDisplayedRef.current;

    gsap.killTweensOf([shell, panel, paragraphs]);
    if (reduceMotion) {
      gsap.set([shell, panel, paragraphs], {
        autoAlpha: 1,
        height: "auto",
        clearProps: "clipPath,transform,opacity,visibility",
      });
      previousDisplayedRef.current = displayedSponsor;
      return;
    }

    const nextHeight = shell.scrollHeight;
    const isSwitch = previousDisplayed !== null && previousDisplayed !== displayedSponsor;
    const direction = switchDirectionRef.current;

    if (isSwitch) {
      gsap.set(panel, { x: direction * -28, autoAlpha: 0 });
      gsap.fromTo(
        shell,
        { height: shell.offsetHeight },
        { height: nextHeight, duration: 0.48, ease: "power2.inOut", clearProps: "height" },
      );
      gsap.to(panel, {
        x: 0,
        autoAlpha: 1,
        duration: 0.5,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility",
      });
      gsap.fromTo(
        paragraphs,
        { autoAlpha: 0, y: 10 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.38,
          ease: "power2.out",
          stagger: 0.045,
          delay: 0.08,
          clearProps: "transform,opacity,visibility",
        },
      );
    } else {
      gsap.set(shell, { height: 0 });
      gsap.set(panel, { clipPath: "inset(0 0 100% 0)", autoAlpha: 0, y: -10 });
      gsap.set(paragraphs, { autoAlpha: 0, y: 12 });

      const opening = gsap.timeline({ defaults: { ease: "power3.out" } });
      opening.to(shell, { height: nextHeight, duration: 0.62, clearProps: "height" });
      opening.to(
        panel,
        {
          clipPath: "inset(0 0 0% 0)",
          autoAlpha: 1,
          y: 0,
          duration: 0.62,
          clearProps: "clipPath,transform,opacity,visibility",
        },
        0,
      );
      opening.to(
        paragraphs,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.48,
          ease: "power2.out",
          stagger: 0.055,
          delay: 0.12,
          clearProps: "transform,opacity,visibility",
        },
        0.12,
      );
    }

    previousDisplayedRef.current = displayedSponsor;
  }, [displayedSponsor]);

  const toggleSponsor = (sponsorId: string) => {
    if (!activeSponsor) {
      setDisplayedSponsor(sponsorId);
      setActiveSponsor(sponsorId);
      return;
    }

    if (activeSponsor !== sponsorId) {
      const currentIndex = sponsors.findIndex((sponsor) => sponsor.id === activeSponsor);
      const nextIndex = sponsors.findIndex((sponsor) => sponsor.id === sponsorId);
      switchDirectionRef.current = nextIndex > currentIndex ? 1 : -1;
      setActiveSponsor(sponsorId);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setDisplayedSponsor(sponsorId);
        return;
      }
      gsap.killTweensOf([shellRef.current, panelRef.current]);
      gsap.to(panelRef.current, {
        x: switchDirectionRef.current * 28,
        autoAlpha: 0,
        duration: 0.22,
        ease: "power2.in",
        onComplete: () => setDisplayedSponsor(sponsorId),
      });
      return;
    }

    const shell = shellRef.current;
    const panel = panelRef.current;
    if (!panel || !shell || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActiveSponsor(null);
      setDisplayedSponsor(null);
      return;
    }

    gsap.killTweensOf([shell, panel]);
    const closing = gsap.timeline({
      defaults: { ease: "power2.in" },
      onComplete: () => {
        setActiveSponsor(null);
        setDisplayedSponsor(null);
      },
    });
    closing.to(panel, {
      clipPath: "inset(0 0 100% 0)",
      autoAlpha: 0,
      y: -8,
      ease: "power2.in",
      duration: 0.34,
    });
    closing.to(shell, {
      height: 0,
      duration: 0.42,
      clearProps: "height",
    }, "-=0.2");
  };

  const activeDetails = sponsors.find((sponsor) => sponsor.id === displayedSponsor);

  return (
    <aside
      aria-label="Sponsors and partners"
      className="sponsors-strip border-b border-black/15 bg-transparent"
      data-motion-managed
      data-motion-sponsors
    >
      <div className="site-container bg-[#ecebe7] py-2.5 sm:py-3">
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
            className="sponsor-details-shell mx-[calc(var(--page-padding)*-1)] overflow-hidden bg-[#ecebe7] px-[var(--page-padding)]"
            ref={shellRef}
          >
            <div
              className="sponsor-details mx-auto max-w-4xl border-t border-black/15 pt-3 sm:pt-4"
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
          </div>
        ) : null}
      </div>
    </aside>
  );
}
