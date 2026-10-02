import { ArticleCoverImage } from "@/features/articles/components/ArticleCoverImage";
import type { Article } from "@/features/articles/types/article";
import { coverFrameProps } from "@/features/articles/lib/cover-placements";
import { cn } from "@/shared/lib/cn";

type ArticleHeroMediaProps = {
  article: Article;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes: string;
};

/**
 * The article-page cover. It keeps the articleHero ratio at every breakpoint:
 * it used to stretch to the headline column on desktop, which turned a
 * landscape file into a tall sliver and cropped most of the photo away.
 */
export function ArticleHeroMedia({
  article,
  className,
  imageClassName,
  priority = false,
  sizes,
}: ArticleHeroMediaProps) {
  return (
    <div
      {...coverFrameProps("articleHero")}
      className={cn(
        "relative w-full min-w-0 overflow-hidden bg-[#eceae4]",
        className,
      )}
    >
      <ArticleCoverImage
        alt={article.coverImage?.alt || article.title}
        className={imageClassName}
        coverImage={article.coverImage}
        fallback={
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
        }
        placement="articleHero"
        priority={priority}
        sizes={sizes}
      />
    </div>
  );
}
