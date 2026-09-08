import Image from "next/image";

import type { Article } from "@/features/articles/types/article";
import { cn } from "@/shared/lib/cn";

/*
 * Below lg the media sits in its own row with no shared height to fill, so it
 * keeps a fixed ratio there. At lg+ it lives beside the headline column in a
 * stretched grid row and instead fills that row's full height edge to edge,
 * so the frame never shows matting above or below the photo.
 */
const HERO_ASPECT_RATIO = "aspect-[3/2] lg:aspect-auto lg:h-full";

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
