import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { ArticleHeroMedia } from "@/features/articles/components/ArticleHeroMedia";
import { ArticleMetadata } from "@/features/articles/components/ArticleMetadata";
import type { Article } from "@/features/articles/types/article";
import { ButtonLink } from "@/shared/components/ui";

type ArticleHeroProps = {
  article: Article;
};

export function ArticleHero({ article }: ArticleHeroProps) {
  const href = `/articles/${article.slug}`;

  return (
    <section className="border-b border-black bg-white">
      <div className="mx-auto grid max-w-[100rem] lg:grid-cols-[minmax(0,0.92fr)_minmax(28rem,0.8fr)]">
        <div className="reveal flex min-w-0 flex-col justify-center px-[var(--page-padding)] py-[clamp(3rem,7vw,7rem)]" suppressHydrationWarning>
          <p className="editorial-kicker text-black/48">Cover story</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="editorial-kicker border-y border-black py-2">
              {article.category}
            </span>
            {article.tags.slice(0, 2).map((tag) => (
              <span
                className="editorial-kicker text-black/45"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mt-7 max-w-[14ch] [overflow-wrap:anywhere] [font-family:var(--font-editorial-title)] text-[clamp(3rem,7.4vw,7rem)] font-bold leading-[0.86] tracking-[-0.05em]">
            <Link className="focus-ring" href={href}>
              {article.title}
            </Link>
          </h1>

          {article.description ? (
            <p className="mt-7 max-w-2xl text-[clamp(1rem,1.5vw,1.2rem)] leading-8 text-black/66">
              {article.description}
            </p>
          ) : null}

          <div className="mt-6">
            <ArticleMetadata article={article} />
          </div>

          <ButtonLink className="mt-8 w-fit" href={href}>
            Read cover story
            <ArrowUpRight aria-hidden="true" size={16} />
          </ButtonLink>
        </div>

        {/*
          The cell stretches to the row height so the artwork panel still bleeds
          from the nav to the section rule, but the illustration inside keeps
          its own ratio and is centred against the paper mat rather than being
          cropped to whatever height the headline column takes.
        */}
        <Link
          className="focus-ring reveal reveal-delay-1 group flex min-w-0 items-center bg-[#eceae4]"
          href={href}
          suppressHydrationWarning
        >
          <ArticleHeroMedia
            article={article}
            imageClassName="transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            priority
            sizes="(min-width: 1600px) 745px, (min-width: 1024px) 47vw, 100vw"
          />
        </Link>
      </div>
    </section>
  );
}
