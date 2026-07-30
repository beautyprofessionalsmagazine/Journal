import Image from "next/image";
import Link from "next/link";

import { ArticleMetadata } from "@/features/articles/components/ArticleMetadata";
import { TagBadge } from "@/features/articles/components/TagBadge";
import type { Article } from "@/features/articles/types/article";

type ArticleHeroProps = {
  article: Article;
};

export function ArticleHero({ article }: ArticleHeroProps) {
  return (
    <section className="grid min-h-[560px] border-b border-black lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.8fr)]">
      <div className="flex flex-col justify-center gap-7 px-5 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-wrap gap-2">
          <TagBadge label={article.category} />
          {article.tags.slice(0, 2).map((tag) => (
            <TagBadge key={tag} label={tag} />
          ))}
        </div>
        <div className="flex max-w-4xl flex-col gap-5">
          <h1 className="mobile-text-lock break-words [font-family:var(--font-editorial-title)] text-2xl font-bold leading-none text-black sm:text-6xl lg:text-7xl">
            <Link href={`/articles/${article.slug}`}>{article.title}</Link>
          </h1>
          <p className="mobile-text-lock max-w-2xl [font-family:var(--font-editorial-sans)] text-base leading-7 text-black/72 sm:text-xl sm:leading-8">
            {article.description}
          </p>
        </div>
        <ArticleMetadata article={article} />
        <Link
          className="inline-flex w-fit items-center border border-black px-5 py-3 [font-family:var(--font-editorial-sans)] text-sm font-semibold uppercase text-black transition hover:bg-black hover:text-white"
          href={`/articles/${article.slug}`}
        >
          Read article
        </Link>
      </div>
      <Link
        aria-label={article.title}
        className="relative min-h-[420px] overflow-hidden bg-black"
        href={`/articles/${article.slug}`}
      >
        {article.coverImage ? (
          <Image
            alt={article.coverImageAlt ?? article.title}
            className="object-cover grayscale"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            src={article.coverImage}
          />
        ) : (
          <span className="flex h-full items-center justify-center [font-family:var(--font-editorial-sans)] text-sm uppercase text-white/60">
            No cover image
          </span>
        )}
      </Link>
    </section>
  );
}
