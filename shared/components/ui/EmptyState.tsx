import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  align?: "center" | "left";
  className?: string;
  headingLevel?: 2 | 3;
  kicker?: string;
  size?: "compact" | "default";
};

export function EmptyState({
  title,
  description,
  action,
  align = "center",
  className,
  headingLevel = 3,
  kicker = "Nothing matched",
  size = "default",
}: EmptyStateProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const isCentered = align === "center";

  return (
    <div
      className={cn(
        "border-y border-black/15",
        size === "compact"
          ? "py-8"
          : "py-[clamp(3.5rem,8vw,7rem)]",
        isCentered ? "text-center" : "text-left",
        className,
      )}
      data-reveal
      suppressHydrationWarning
    >
      <p className="editorial-kicker text-black/45">{kicker}</p>
      <Heading
        className={cn(
          "mt-3 [font-family:var(--font-editorial-title)] font-bold leading-none text-black",
          size === "compact"
            ? "text-[clamp(1.8rem,4vw,2.6rem)]"
            : "text-[clamp(2rem,6vw,3.5rem)]",
          isCentered && "mx-auto max-w-xl",
        )}
      >
        {title}
      </Heading>
      <p
        className={cn(
          "mt-3 [font-family:var(--font-editorial-sans)] text-sm leading-6 text-black/62",
          isCentered && "mx-auto max-w-xl",
        )}
      >
        {description}
      </p>
      {action ? (
        <div
          className={cn(
            "mt-6 flex flex-wrap gap-3",
            isCentered && "justify-center",
          )}
        >
          {action}
        </div>
      ) : null}
    </div>
  );
}
