import Image from "next/image";

import type { Article } from "@/features/articles/types/article";
import { cn } from "@/shared/lib/cn";

/*
 * Article illustrations come from one standardized landscape template, so the
 * hero frame is locked to its ratio instead of stretching to whatever height
 * the headline column happens to take. That keeps the artwork identical from
 * article to article: the template fills the frame edge to edge with nothing
 * trimmed, and a cover that deviates from the template is cropped evenly from
 * the centre rather than drifting sideways with its own dimensions.
 */
const HERO_ASPECT_RATIO = "aspect-[3/2]";

type ArticleHeroMediaProps = {
  article: Article;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes: string;
};

export function ArticleHeroMedia({
  article,
  className,
  imageClassName,
  priority = false,
  sizes,
}: ArticleHeroMediaProps) {
  return (
    <div
      className={cn(
        "relative w-full min-w-0 overflow-hidden bg-[#eceae4]",
        HERO_ASPECT_RATIO,
        className,
      )}
    >
      {article.coverImage ? (
        <Image
          alt={article.coverImageAlt ?? article.title}
          className={cn(
            "object-cover object-center",
            imageClassName,
          )}
          fill
          priority={priority}
          sizes={sizes}
          src={article.coverImage}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
          <span
            aria-hidden="true"
            className="[font-family:var(--font-editorial-title)] text-[clamp(5rem,14vw,11rem)] font-bold leading-none text-black/10"
          >
            {article.category.charAt(0)}
          </span>
          <span className="editorial-kicker mt-2 text-black/40">
            Cover image forthcoming
          </span>
        </div>
      )}
    </div>
  );
}
