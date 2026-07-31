import Image from "next/image";
import Link from "next/link";

import { ArticleMetadata } from "@/features/articles/components/ArticleMetadata";
import type { Article } from "@/features/articles/types/article";
import { cn } from "@/shared/lib/cn";

export type ArticleCardVariant = "primary" | "standard" | "compact";

type ArticleCardProps = {
  article: Article;
  compact?: boolean;
  priority?: boolean;
  variant?: ArticleCardVariant;
};

export function ArticleCard({
  article,
  compact = false,
  priority = false,
  variant = compact ? "compact" : "standard",
}: ArticleCardProps) {
  const href = `/articles/${article.slug}`;
  const isCompact = variant === "compact";
  const isPrimary = variant === "primary";

  return (
    <article
      className={cn(
        "group min-w-0 border-t border-black pt-4",
        isCompact
          ? "grid grid-cols-[6.5rem_minmax(0,1fr)] items-start gap-4"
          : "flex flex-col gap-5",
        isPrimary && "md:col-span-2 xl:col-span-2",
      )}
      data-reveal
    >
      <Link
        className={cn(
          "focus-ring relative block overflow-hidden bg-[#eceae4]",
          isCompact ? "aspect-[4/5]" : isPrimary ? "aspect-[16/9]" : "aspect-[4/3]",
        )}
        href={href}
      >
        {article.coverImage ? (
          <Image
            alt={article.coverImageAlt ?? article.title}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
            fill
            priority={priority}
            sizes={
              isCompact
                ? "104px"
                : isPrimary
                  ? "(min-width: 1280px) 62vw, (min-width: 768px) 66vw, 100vw"
                  : "(min-width: 1280px) 29vw, (min-width: 768px) 47vw, 100vw"
            }
            src={article.coverImage}
          />
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-2 border border-black/10 px-3 text-center">
            <span
              aria-hidden="true"
              className="[font-family:var(--font-editorial-title)] text-[clamp(3rem,10vw,7rem)] font-bold leading-none text-black/12"
            >
              {article.category.charAt(0)}
            </span>
            <span className="editorial-kicker text-black/42">
              Image forthcoming
            </span>
          </span>
        )}
      </Link>

      <div
        className={cn(
          "min-w-0 transition-transform duration-300 ease-out group-hover:-translate-y-1",
          isCompact ? "flex flex-col gap-2" : "flex flex-col gap-3",
        )}
      >
        <p className="editorial-kicker text-black/55">{article.category}</p>
        <h3
          className={cn(
            "[overflow-wrap:anywhere] [font-family:var(--font-editorial-title)] font-bold tracking-[-0.025em]",
            isCompact
              ? "text-[clamp(1.2rem,4.6vw,1.55rem)] leading-[1.02]"
              : isPrimary
                ? "max-w-[20ch] text-[clamp(2.25rem,5vw,4.7rem)] leading-[0.95]"
                : "text-[clamp(1.8rem,3vw,2.65rem)] leading-[1.02]",
          )}
        >
          <Link
            className="focus-ring inline-flex min-h-11 items-center decoration-1 underline-offset-4 hover:underline"
            href={href}
          >
            {article.title}
          </Link>
        </h3>
        {!isCompact && article.description ? (
          <p
            className={cn(
              "max-w-2xl text-sm leading-6 text-black/64",
              isPrimary && "text-[clamp(0.95rem,1.5vw,1.12rem)] leading-7",
            )}
          >
            {article.description}
          </p>
        ) : null}
        <ArticleMetadata article={article} />
      </div>
    </article>
  );
}
