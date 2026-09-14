"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { type ReactNode, useRef, useSyncExternalStore } from "react";

type MotionProviderProps = {
  children: ReactNode;
};

gsap.registerPlugin(useGSAP, ScrollTrigger);

const subscribeToHydration = () => () => undefined;

/** Owns scoped editorial entrances, hover motion, and scroll reveals. */
export function MotionProvider({ children }: MotionProviderProps) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  useGSAP(
    (_context, contextSafe) => {
      const root = rootRef.current;
      if (!root || !isHydrated) return;

      const media = gsap.matchMedia();
      const makeContextSafe =
        contextSafe ?? ((callback: () => void) => callback);

      media.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          canHover: "(hover: hover) and (pointer: fine)",
        },
        ({ conditions }) => {
          const reduceMotion = conditions?.reduceMotion;
          const canHover = conditions?.canHover;
          const managed = gsap.utils.toArray<HTMLElement>(
            "[data-motion-managed], [data-reveal]",
            root,
          );

          if (reduceMotion) {
            gsap.set(managed, {
              autoAlpha: 1,
              clearProps: "clipPath,transform,opacity,visibility",
            });
            return;
          }

          const header = root.querySelector<HTMLElement>("[data-motion-header]");
          const navItems = gsap.utils
            .toArray<HTMLElement>("[data-motion-nav-item]", root)
            .filter((item) => item.offsetParent !== null);
          const sponsorsStrip = root.querySelector<HTMLElement>("[data-motion-sponsors]");
          const sponsorItems = gsap.utils.toArray<HTMLElement>("[data-motion-sponsor-item]", root);
          const featureMedia = root.querySelector<HTMLElement>("[data-motion-feature-media]");
          const featureCopy = root.querySelector<HTMLElement>("[data-motion-feature-copy]");
          const recentCards = gsap.utils.toArray<HTMLElement>("[data-motion-recent-card]", root);
          const opening = gsap.timeline({
            defaults: { duration: 0.7, ease: "power3.out" },
          });

          if (header) {
            opening.from(header, {
              autoAlpha: 0,
              y: -18,
              clearProps: "transform,opacity,visibility",
            });
          }
          if (navItems.length) {
            opening.from(
              navItems,
              {
                autoAlpha: 0,
                y: -8,
                duration: 0.45,
                stagger: 0.035,
                clearProps: "transform,opacity,visibility",
              },
              "<0.1",
            );
          }
          if (sponsorsStrip) {
            opening.from(
              sponsorsStrip,
              {
                autoAlpha: 0,
                y: -10,
                duration: 0.55,
                clearProps: "transform,opacity,visibility",
              },
              "<0.12",
            );
          }
          if (sponsorItems.length) {
            opening.from(
              sponsorItems,
              {
                autoAlpha: 0,
                x: -10,
                duration: 0.45,
                stagger: 0.065,
                clearProps: "transform,opacity,visibility",
              },
              "<0.08",
            );
          }
          if (featureMedia) {
            opening.fromTo(
              featureMedia,
              { clipPath: "inset(0 0 100% 0)" },
              {
                clipPath: "inset(0 0 0% 0)",
                duration: 0.9,
                ease: "power3.inOut",
                clearProps: "clipPath",
              },
              "<0.08",
            );
          }
          if (featureCopy) {
            opening.from(
              featureCopy.children,
              {
                autoAlpha: 0,
                y: 18,
                duration: 0.6,
                stagger: 0.07,
                clearProps: "transform,opacity,visibility",
              },
              "<0.35",
            );
          }
          if (recentCards.length) {
            opening.from(
              recentCards,
              {
                autoAlpha: 0,
                y: 20,
                duration: 0.62,
                stagger: 0.09,
                clearProps: "transform,opacity,visibility",
              },
              "<0.12",
            );
          }

          const genericReveals = gsap.utils.toArray<HTMLElement>(
            "[data-reveal]:not([data-motion-managed])",
            root,
          );

          if (genericReveals.length) {
            gsap.set(genericReveals, { autoAlpha: 0, y: 18 });
            ScrollTrigger.batch(genericReveals, {
              start: "clamp(top 88%)",
              once: true,
              interval: 0.08,
              batchMax: 4,
              onEnter: (batch) => {
                gsap.to(batch, {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.62,
                  ease: "power3.out",
                  stagger: 0.07,
                  overwrite: "auto",
                  clearProps: "transform,opacity,visibility",
                });
              },
            });
          }

          if (canHover) {
            const hoverTargets = gsap.utils.toArray<HTMLElement>(
              "[data-motion-story-hover]",
              root,
            );
            const cleanups: Array<() => void> = [];

            hoverTargets.forEach((target) => {
              const image = target.querySelector<HTMLElement>(".story-image");
              if (!image) return;

              const enter = makeContextSafe(() => {
                gsap.to(image, {
                  scale: 1.025,
                  duration: 0.55,
                  ease: "power2.out",
                  overwrite: "auto",
                });
              });
              const leave = makeContextSafe(() => {
                gsap.to(image, {
                  scale: 1,
                  duration: 0.55,
                  ease: "power2.out",
                  overwrite: "auto",
                });
              });

              target.addEventListener("pointerenter", enter);
              target.addEventListener("pointerleave", leave);
              cleanups.push(() => {
                target.removeEventListener("pointerenter", enter);
                target.removeEventListener("pointerleave", leave);
              });
            });

            return () => cleanups.forEach((cleanUp) => cleanUp());
          }
        },
      );

      return () => media.revert();
    },
    {
      dependencies: [isHydrated, pathname],
      scope: rootRef,
      revertOnUpdate: true,
    },
  );

  return (
    <div className="min-h-screen" key={pathname} ref={rootRef}>
      {children}
    </div>
  );
}
