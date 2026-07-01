import Image from "next/image";
import Link from "next/link";

import { ArticleMetadata } from "@/features/articles/components/ArticleMetadata";
import { TagBadge } from "@/features/articles/components/TagBadge";
import type { Article } from "@/features/articles/types/article.types";
import { cn } from "@/shared/lib/cn";

type ArticleCardProps = {
  article: Article;
  compact?: boolean;
};

export function ArticleCard({ article, compact = false }: ArticleCardProps) {
  return (
    <article
      className={cn(
        "group grid gap-4 border-t border-black/15 pt-5",
        compact ? "grid-cols-[96px_1fr] items-start" : "",
      )}
    >
      <Link
        aria-label={article.title}
        className={cn(
          "relative block overflow-hidden bg-black/5",
          compact ? "aspect-[4/5]" : "aspect-[4/3]",
        )}
        href={`/articles/${article.slug}`}
      >
        <Image
          alt=""
          className="object-cover grayscale transition duration-500 group-hover:scale-105"
          fill
          sizes={compact ? "96px" : "(min-width: 1024px) 30vw, 90vw"}
          src={article.coverImage}
        />
      </Link>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <TagBadge label={article.category} />
          {article.tags.slice(0, compact ? 1 : 2).map((tag) => (
            <TagBadge key={tag} label={tag} />
          ))}
        </div>
        <h3
          className={cn(
            "[font-family:var(--font-editorial-title)] font-bold leading-tight text-black",
            compact ? "text-xl" : "text-3xl",
          )}
        >
          <Link href={`/articles/${article.slug}`}>{article.title}</Link>
        </h3>
        <p className="[font-family:var(--font-editorial-sans)] text-sm leading-6 text-black/65">
          {article.annotation}
        </p>
        <ArticleMetadata article={article} />
      </div>
    </article>
  );
}
