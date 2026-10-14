import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleBody } from "@/features/articles/components/ArticleBody";
import { ArticleGrid } from "@/features/articles/components/ArticleGrid";
import { ArticleHeroMedia } from "@/features/articles/components/ArticleHeroMedia";
import { ArticleMetadata } from "@/features/articles/components/ArticleMetadata";
import { TagBadge } from "@/features/articles/components/TagBadge";
import { getArticleJsonLd } from "@/features/articles/seo/article-seo";
import {
  getPublishedArticleBySlug,
  getRelatedArticles,
} from "@/features/articles/server/article-queries";
import type { TiptapDocument } from "@/features/articles/types/article";
import { getCategoryByName } from "@/features/categories/server/categories";
import type { CategoryName } from "@/features/categories/types/category.types";
import { Breadcrumbs } from "@/shared/components/public/Breadcrumbs";
import { JsonLd } from "@/shared/components/seo/JsonLd";
import { ButtonLink } from "@/shared/components/ui";
import type { BreadcrumbItem } from "@/shared/seo/json-ld";

type ArticleDetailPageProps = {
  slug: string;
};

export async function ArticleDetailPage({ slug }: ArticleDetailPageProps) {
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article);
  const categoryHref =
    getCategoryByName(article.category as CategoryName)?.href ??
    `/category/${article.category.toLowerCase()}`;
  // One trail drives both the visible breadcrumb and the BreadcrumbList
  // structured data, so the two can never disagree.
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Home", path: "/" },
    { name: article.category, path: categoryHref },
    { name: article.title, path: `/articles/${article.slug}` },
  ];

  return (
    <main className="bg-white">
      <JsonLd data={getArticleJsonLd(article, breadcrumbs)} />
      <article>
        <header className="site-container py-[clamp(2rem,5vw,5rem)]">
          <Breadcrumbs items={breadcrumbs} />

          <div className="mt-7 grid min-w-0 gap-[clamp(2.5rem,5vw,6rem)] lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.72fr)]">
            <div className="reveal min-w-0" suppressHydrationWarning>
              <div className="flex flex-wrap gap-2">
                <TagBadge label={article.category} />
                {article.tags.slice(0, 3).map((tag) => (
                  <TagBadge key={tag} label={tag} />
                ))}
              </div>
              <h1 className="mt-7 max-w-[16ch] [overflow-wrap:anywhere] [font-family:var(--font-editorial-title)] text-[clamp(2.65rem,7vw,7.2rem)] font-bold leading-[0.88] tracking-[-0.05em]">
                {article.title}
              </h1>
              {article.description ? (
                <p className="mt-7 max-w-3xl text-[clamp(1rem,1.7vw,1.3rem)] leading-[1.65] text-black/66">
                  {article.description}
                </p>
              ) : null}
              <div className="mt-7 border-t border-black/15 pt-5">
                <ArticleMetadata article={article} includeCredits />
              </div>
            </div>

            <div
              // A portrait cover at full tablet width would push the story
              // below the fold, so the stacked layout caps its width.
              className="reveal reveal-delay-1 min-w-0 max-w-xl lg:max-w-none"
              suppressHydrationWarning
            >
              <ArticleHeroMedia
                article={article}
                priority
                sizes="(min-width: 1440px) 520px, (min-width: 1024px) 38vw, (min-width: 640px) 576px, 100vw"
              />
            </div>
          </div>
        </header>

        <section className="border-t border-black px-[var(--page-padding)] py-[var(--section-space)]">
          <ArticleBody content={article.contentJson as TiptapDocument | null} />
        </section>

        <footer className="mx-auto flex max-w-[54rem] flex-col gap-5 border-t border-black px-[var(--page-padding)] py-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="[font-family:var(--font-editorial-body-sans)] text-sm italic text-black/58">
            {article.views.toLocaleString()} views
          </p>
          <ButtonLink href="/articles" variant="secondary">
            Return to all stories
          </ButtonLink>
        </footer>
      </article>

      <section className="border-t border-black bg-[#f6f4ef] py-[var(--section-space)]">
        <div className="site-container">
          <div className="mb-[clamp(2.5rem,5vw,5rem)] flex flex-col gap-4 border-b border-black pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="editorial-kicker mb-2 text-black/45">
                Continue reading
              </p>
              <h2 className="section-title">Related Stories</h2>
            </div>
            <Link
              className="focus-ring inline-flex min-h-11 items-center text-xs font-semibold uppercase tracking-[0.08em]"
              href={categoryHref}
            >
              More in {article.category}
            </Link>
          </div>
          <ArticleGrid
            articles={relatedArticles}
            emptyDescription="New related stories will appear here as the magazine grows."
            emptyTitle="No related articles yet"
            prioritizeFirst={false}
          />
        </div>
      </section>
    </main>
  );
}
