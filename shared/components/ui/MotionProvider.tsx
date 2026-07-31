"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect } from "react";

type MotionProviderProps = {
  children: ReactNode;
};

const revealSelector = ".reveal, [data-reveal]";

export function MotionProvider({ children }: MotionProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const revealImmediately =
      prefersReducedMotion || !("IntersectionObserver" in window);
    const intersectionObserver = revealImmediately
      ? null
      : new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                intersectionObserver?.unobserve(entry.target);
              }
            });
          },
          {
            rootMargin: "0px 0px -8% 0px",
            threshold: 0.08,
          },
        );

    function registerRevealElements(root: ParentNode) {
      const elements = [
        ...(root instanceof Element && root.matches(revealSelector)
          ? [root]
          : []),
        ...Array.from(root.querySelectorAll(revealSelector)),
      ];

      elements.forEach((element) => {
        if (element.classList.contains("is-visible")) {
          return;
        }

        if (revealImmediately) {
          element.classList.add("is-visible");
        } else {
          intersectionObserver?.observe(element);
        }
      });
    }

    registerRevealElements(document);

    const mutationObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            registerRevealElements(node);
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      intersectionObserver?.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return (
    <div className="page-transition min-h-screen" key={pathname}>
      {children}
    </div>
  );
}
