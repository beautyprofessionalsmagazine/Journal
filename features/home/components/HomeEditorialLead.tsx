import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import {
  getFeaturedArticle,
  listPublishedArticles,
} from "@/features/articles/server/article-queries";
import type { Article } from "@/features/articles/types/article";
import { HomeStoryImage } from "@/features/home/components/HomeStoryImage";

export async function HomeEditorialLead() {
  const [featuredArticle, publishedArticles] = await Promise.all([
    getFeaturedArticle(),
    listPublishedArticles({ sort: "latest" }),
  ]);

  const remainingArticles = publishedArticles.filter(
    (article) => article.id !== featuredArticle?.id,
  );
  const recentArticles = remainingArticles.slice(0, 3);
  const latestArticles = remainingArticles.slice(3, 7);
  const spotlightArticles = remainingArticles.slice(7, 9);
  const archiveArticles = remainingArticles.slice(9, 13);

  if (!featuredArticle) {
    return <EmptyEditorialDesk />;
  }

  return (
    <div className="bg-white">
      <section className="site-container pb-[clamp(3.5rem,6vw,6.5rem)] pt-[clamp(1rem,2vw,1.75rem)]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.92fr)_minmax(18rem,0.92fr)]">
          <FeaturedStory article={featuredArticle} />
          <RecentStories articles={recentArticles} />
        </div>
      </section>

      {latestArticles.length ? (
        <StoryGrid
          articles={latestArticles}
          eyebrow="Fresh from the desk"
          title="Latest Stories"
        />
      ) : null}

      {spotlightArticles.length ? (
        <EditorialSpotlights articles={spotlightArticles} />
      ) : null}

      {archiveArticles.length ? (
        <StoryGrid
          articles={archiveArticles}
          compact
          eyebrow="Worth another look"
          title="From the Archive"
        />
      ) : null}
    </div>
  );
}

function FeaturedStory({ article }: { article: Article }) {
  const href = `/articles/${article.slug}`;

  return (
    <article
      className="home-feature relative min-w-0 border-b border-black bg-[#e9e5de] lg:min-h-[42rem] lg:border-b-0"
      data-motion-managed
    >
      <Link
        aria-label={`Read ${article.title}`}
        className="home-feature-media focus-ring group relative block aspect-[4/3] overflow-hidden lg:absolute lg:inset-0 lg:aspect-auto"
        data-motion-feature-media
        data-motion-story-hover
        href={href}
      >
        <StoryImage
          article={article}
          priority
          sizes="(min-width: 1280px) 65vw, (min-width: 1024px) 67vw, 100vw"
        />
      </Link>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-[54%] bg-gradient-to-r from-[#f7f4ee] from-12% via-[#f7f4ee]/92 via-58% to-transparent lg:block"
      />

      <div
        className="home-feature-copy relative z-10 bg-white px-0 pb-7 pt-6 lg:absolute lg:inset-y-0 lg:left-0 lg:flex lg:w-[57%] lg:flex-col lg:justify-center lg:bg-transparent lg:p-[clamp(2rem,4vw,4.25rem)]"
        data-motion-feature-copy
      >
        <p className="editorial-kicker text-[var(--champagne-dark)]">
          {article.category}
        </p>
        <h1
          className={`${getFeatureHeadlineClass(article.title)} mt-3 [overflow-wrap:break-word] [font-family:var(--font-editorial-title)] font-bold tracking-[-0.048em]`}
        >
          <Link
            className="focus-ring decoration-2 underline-offset-8 hover:underline"
            href={href}
          >
            {article.title}
          </Link>
        </h1>
        {article.description ? (
          <p className="mt-5 max-w-[31rem] text-[clamp(0.95rem,1.25vw,1.08rem)] leading-7 text-black/68">
            {article.description}
          </p>
        ) : null}
        <p className="mt-4 text-xs text-black/52">
          {formatArticleDate(article)}
        </p>
        <Link
          className="focus-ring mt-7 inline-flex min-h-11 w-fit items-center gap-3 bg-black px-5 [font-family:var(--font-editorial-sans)] text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[var(--champagne-dark)]"
          href={href}
        >
          Read the feature
          <ArrowRight aria-hidden="true" size={15} strokeWidth={1.6} />
        </Link>
      </div>
    </article>
  );
}

function RecentStories({ articles }: { articles: Article[] }) {
  return (
    <aside
      aria-label="Recent stories"
      className="home-recent min-w-0 divide-y divide-black/15 border-y border-black/15 lg:border-y-0"
    >
      {articles.map((article) => (
        <article
          className="home-recent-card group grid min-w-0 grid-cols-[7.5rem_minmax(0,1fr)] gap-4 py-5 first:pt-0 last:pb-0 sm:grid-cols-[10rem_minmax(0,1fr)] lg:grid-cols-[minmax(7rem,0.9fr)_minmax(0,1.1fr)] lg:py-5 2xl:grid-cols-[minmax(8.5rem,0.9fr)_minmax(0,1.1fr)]"
          data-motion-managed
          data-motion-recent-card
          data-motion-story-hover
          key={article.id}
        >
          <Link
            className="focus-ring relative block aspect-[4/3] overflow-hidden bg-[#eceae4] lg:aspect-[1.1/1]"
            href={`/articles/${article.slug}`}
          >
            <StoryImage
              article={article}
              sizes="(min-width: 1024px) 14vw, 160px"
            />
          </Link>
          <div className="min-w-0 self-center">
            <p className="editorial-kicker text-black/45">{article.category}</p>
            <h2 className="mt-2 [overflow-wrap:break-word] [font-family:var(--font-editorial-title)] text-[clamp(1.25rem,2.1vw,1.75rem)] font-bold leading-[0.98] tracking-[-0.025em]">
              <Link
                className="focus-ring decoration-1 underline-offset-4 hover:underline"
                href={`/articles/${article.slug}`}
              >
                {article.title}
              </Link>
            </h2>
            {article.description ? (
              <p className="mt-2 hidden text-xs leading-5 text-black/58 sm:block lg:hidden 2xl:block">
                {article.description}
              </p>
            ) : null}
            <p className="mt-3 text-[0.7rem] text-black/45">
              {formatArticleDate(article)}
            </p>
          </div>
        </article>
      ))}
    </aside>
  );
}

function StoryGrid({
  articles,
  compact = false,
  eyebrow,
  title,
}: {
  articles: Article[];
  compact?: boolean;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="border-t border-black/15 bg-white py-[clamp(3.25rem,6vw,6rem)]">
      <div className="site-container">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <div className="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {articles.map((article) => (
            <StoryCard article={article} compact={compact} key={article.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StoryCard({ article, compact }: { article: Article; compact: boolean }) {
  const href = `/articles/${article.slug}`;

  return (
    <article className="group min-w-0" data-reveal data-motion-story-hover>
      <Link
        className={`focus-ring relative block overflow-hidden bg-[#eceae4] ${compact ? "aspect-[16/9]" : "aspect-[4/3]"}`}
        href={href}
      >
        <StoryImage
          article={article}
          sizes="(min-width: 1280px) 22vw, (min-width: 640px) 46vw, 100vw"
        />
      </Link>
      <p className="editorial-kicker mt-4 text-black/48">{article.category}</p>
      <h3
        className={`mt-2 [overflow-wrap:break-word] [font-family:var(--font-editorial-title)] font-bold tracking-[-0.025em] ${getCardHeadlineClass(article.title, compact)}`}
      >
        <Link
          className="focus-ring decoration-1 underline-offset-4 hover:underline"
          href={href}
        >
          {article.title}
        </Link>
      </h3>
      {!compact && article.description ? (
        <p className="mt-3 text-sm leading-6 text-black/60">
          {article.description}
        </p>
      ) : null}
      <p className="mt-3 text-xs text-black/45">{formatArticleDate(article)}</p>
    </article>
  );
}

function EditorialSpotlights({ articles }: { articles: Article[] }) {
  return (
    <section aria-label="Editorial spotlights" className="bg-white">
      <div className="grid lg:grid-cols-2">
        {articles.map((article, index) => (
          <SpotlightStory article={article} dark={index === 0} key={article.id} />
        ))}
      </div>
    </section>
  );
}

function SpotlightStory({ article, dark }: { article: Article; dark: boolean }) {
  const href = `/articles/${article.slug}`;

  if (dark) {
    return (
      <article
        className="group relative min-h-[29rem] overflow-hidden bg-black text-white"
        data-reveal
        data-motion-story-hover
      >
        <StoryImage article={article} sizes="(min-width: 1024px) 50vw, 100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/54 to-black/10" />
        <SpotlightCopy article={article} href={href} inverted />
      </article>
    );
  }

  return (
    <article
      className="group grid min-h-[29rem] overflow-hidden bg-[#f1eee8] md:grid-cols-[0.9fr_1.1fr] lg:grid-cols-1 xl:grid-cols-[0.9fr_1.1fr]"
      data-reveal
      data-motion-story-hover
    >
      <div className="relative z-10 flex items-center">
        <SpotlightCopy article={article} href={href} />
      </div>
      <Link className="focus-ring relative min-h-80 overflow-hidden" href={href}>
        <StoryImage article={article} sizes="(min-width: 1280px) 28vw, 50vw" />
      </Link>
    </article>
  );
}

function SpotlightCopy({
  article,
  href,
  inverted = false,
}: {
  article: Article;
  href: string;
  inverted?: boolean;
}) {
  return (
    <div className="relative z-10 p-[clamp(2rem,5vw,4rem)]">
      <p className={`editorial-kicker ${inverted ? "text-white/62" : "text-black/45"}`}>
        {article.category}
      </p>
      <h2 className="mt-3 max-w-[13ch] [overflow-wrap:break-word] [font-family:var(--font-editorial-title)] text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[0.94] tracking-[-0.035em]">
        <Link className="focus-ring decoration-2 underline-offset-7 hover:underline" href={href}>
          {article.title}
        </Link>
      </h2>
      {article.description ? (
        <p className={`mt-5 max-w-sm text-sm leading-6 ${inverted ? "text-white/72" : "text-black/62"}`}>
          {article.description}
        </p>
      ) : null}
      <Link
        className={`focus-ring mt-6 inline-flex min-h-11 items-center gap-3 border-b text-[0.68rem] font-semibold uppercase tracking-[0.12em] ${inverted ? "border-white text-white" : "border-black text-black"}`}
        href={href}
      >
        Read more
        <ArrowRight aria-hidden="true" size={14} />
      </Link>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex items-end justify-between gap-5 border-b border-black pb-3">
      <div>
        <p className="editorial-kicker text-black/42">{eyebrow}</p>
        <h2 className="mt-1 [font-family:var(--font-editorial-title)] text-[clamp(2.25rem,4vw,3.6rem)] font-bold leading-none tracking-[-0.035em]">
          {title}
        </h2>
      </div>
      <Link
        className="focus-ring inline-flex min-h-11 shrink-0 items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.1em] hover:text-[var(--champagne-dark)]"
        href="/articles"
      >
        View all
        <ArrowUpRight aria-hidden="true" size={14} />
      </Link>
    </div>
  );
}

function EmptyEditorialDesk() {
  return (
    <section className="site-container py-[var(--section-space)] text-center">
      <p className="editorial-kicker text-black/45">From the editorial desk</p>
      <h1 className="mx-auto mt-4 max-w-4xl [font-family:var(--font-editorial-title)] text-[clamp(3rem,8vw,7rem)] font-bold leading-[0.88] tracking-[-0.05em]">
        The next cover story is being prepared.
      </h1>
    </section>
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
  return (
    <HomeStoryImage
      alt={article.coverImageAlt ?? article.title}
      category={article.category}
      priority={priority}
      sizes={sizes}
      src={article.coverImage}
    />
  );
}

function getFeatureHeadlineClass(title: string) {
  if (title.length > 72) {
    return "max-w-[17ch] text-[clamp(2.1rem,3.2vw,3.2rem)] leading-[0.92]";
  }

  if (title.length > 54) {
    return "max-w-[13ch] text-[clamp(2.35rem,4.05vw,4.25rem)] leading-[0.9]";
  }

  return "max-w-[10ch] text-[clamp(2.65rem,5vw,5.25rem)] leading-[0.88]";
}

function getCardHeadlineClass(title: string, compact: boolean) {
  if (compact) {
    return "text-[clamp(1.35rem,2.1vw,1.7rem)] leading-[1.02]";
  }

  if (title.length > 76) {
    return "text-[clamp(1.35rem,1.65vw,1.55rem)] leading-[1.02]";
  }

  if (title.length > 48) {
    return "text-[clamp(1.45rem,1.9vw,1.75rem)] leading-[1]";
  }

  return "text-[clamp(1.65rem,2.45vw,2.05rem)] leading-[0.98]";
}

function formatArticleDate(article: Article) {
  if (!article.publishedAt) return `By ${article.author}`;

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(article.publishedAt);
}
