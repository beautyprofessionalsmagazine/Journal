import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ArticleMetadata } from "@/features/articles/components/ArticleMetadata";
import {
  getFeaturedArticle,
  listPublishedArticles,
} from "@/features/articles/server/article-queries";
import type { Article } from "@/features/articles/types/article";

export async function HomeEditorialLead() {
  const featuredArticle = await getFeaturedArticle();
  const recentArticles = await listPublishedArticles({
    excludeId: featuredArticle?.id,
    limit: 3,
    sort: "latest",
  });

  return (
    <section className="home-lead bg-white">
      <div className="site-container py-[clamp(2rem,5vw,5.5rem)]">
        <div className="mb-[clamp(1.5rem,3vw,2.75rem)] flex items-end justify-between gap-5 border-b border-black pb-3">
          <div>
            <p className="editorial-kicker text-[var(--champagne)]">The Journal</p>
            <h1 className="mt-2 [font-family:var(--font-editorial-title)] text-[clamp(2.2rem,5vw,4.8rem)] font-bold leading-[0.88] tracking-[-0.045em]">
              Stories shaping beauty now.
            </h1>
          </div>
          <p className="hidden max-w-56 pb-1 text-right text-xs leading-5 text-black/50 md:block">
            Independent reporting for the people defining the industry.
          </p>
        </div>

        {featuredArticle ? (
          <div className="grid gap-[clamp(2.5rem,5vw,5rem)] lg:grid-cols-[minmax(0,7fr)_minmax(18rem,3fr)]">
            <FeaturedStory article={featuredArticle} />
            <RecentStories articles={recentArticles} />
          </div>
        ) : (
          <div className="border-b border-black py-[clamp(5rem,12vw,10rem)] text-center">
            <p className="editorial-kicker text-black/45">From the editorial desk</p>
            <h2 className="mx-auto mt-4 max-w-4xl [font-family:var(--font-editorial-title)] text-[clamp(3rem,8vw,7rem)] font-bold leading-[0.88] tracking-[-0.05em]">
              The next cover story is being prepared.
            </h2>
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturedStory({ article }: { article: Article }) {
  const href = `/articles/${article.slug}`;

  return (
    <article className="home-feature min-w-0">
      <Link
        className="home-feature-media focus-ring group relative block aspect-[16/10] overflow-hidden bg-[#eceae4]"
        href={href}
      >
        <StoryImage article={article} priority sizes="(min-width: 1440px) 960px, (min-width: 1024px) 67vw, 100vw" />
      </Link>
      <div className="home-feature-copy border-b border-black pb-7 pt-5 sm:pt-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="editorial-kicker text-[var(--champagne-dark)]">{article.category}</p>
          <ArticleMetadata article={article} />
        </div>
        <h2 className="mt-4 max-w-[18ch] [overflow-wrap:anywhere] [font-family:var(--font-editorial-title)] text-[clamp(2.7rem,6vw,6rem)] font-bold leading-[0.88] tracking-[-0.05em]">
          <Link className="focus-ring decoration-2 underline-offset-8 hover:underline" href={href}>
            {article.title}
          </Link>
        </h2>
        {article.description ? (
          <p className="mt-5 max-w-3xl text-[clamp(1rem,1.6vw,1.2rem)] leading-8 text-black/64">
            {article.description}
          </p>
        ) : null}
        <Link
          className="focus-ring mt-6 inline-flex min-h-11 items-center gap-2 border-b border-black [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase tracking-[0.1em] transition-colors hover:border-[var(--champagne-dark)] hover:text-[var(--champagne-dark)]"
          href={href}
        >
          Read the feature
          <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.6} />
        </Link>
      </div>
    </article>
  );
}

function RecentStories({ articles }: { articles: Article[] }) {
  return (
    <aside aria-label="Recent stories" className="home-recent min-w-0 lg:border-l lg:border-black lg:pl-[clamp(1.5rem,3vw,3rem)]">
      <div className="flex items-center justify-between border-b border-black pb-3">
        <h2 className="editorial-kicker">Recent stories</h2>
        <Link
          className="focus-ring text-xs font-semibold underline decoration-1 underline-offset-4 hover:text-[var(--champagne-dark)]"
          href="/articles"
        >
          View all
        </Link>
      </div>
      <div className="home-recent-list divide-y divide-black/20">
        {articles.map((article) => (
          <article className="home-recent-card group py-6" key={article.id}>
            <Link
              className="focus-ring relative mb-4 block aspect-[16/10] overflow-hidden bg-[#eceae4]"
              href={`/articles/${article.slug}`}
            >
              <StoryImage article={article} sizes="(min-width: 1024px) 28vw, 100vw" />
            </Link>
            <p className="editorial-kicker text-[var(--champagne-dark)]">{article.category}</p>
            <h3 className="mt-2 [overflow-wrap:anywhere] [font-family:var(--font-editorial-title)] text-[clamp(1.65rem,2.4vw,2.35rem)] font-bold leading-[0.98] tracking-[-0.03em]">
              <Link
                className="focus-ring decoration-1 underline-offset-4 hover:underline"
                href={`/articles/${article.slug}`}
              >
                {article.title}
              </Link>
            </h3>
            <div className="mt-3">
              <ArticleMetadata article={article} />
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}

function StoryImage({
  article,
  priority = false,
  sizes,
}: {
  article: Article;
  priority?: boolean;
  sizes: string;
}) {
  if (!article.coverImage) {
    return (
      <span className="flex h-full items-center justify-center [font-family:var(--font-editorial-title)] text-[clamp(4rem,12vw,9rem)] font-bold text-black/12">
        {article.category.charAt(0)}
      </span>
    );
  }

  return (
    <Image
      alt={article.coverImageAlt ?? article.title}
      className="story-image object-cover"
      fill
      priority={priority}
      sizes={sizes}
      src={article.coverImage}
    />
  );
}
