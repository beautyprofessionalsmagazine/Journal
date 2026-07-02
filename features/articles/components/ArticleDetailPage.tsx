import Image from "next/image";
import { notFound } from "next/navigation";

import {
  getArticleBySlug,
  getRelatedArticles,
} from "@/features/articles/server/articles";
import { ArticleBody } from "@/features/articles/components/ArticleBody";
import { ArticleGrid } from "@/features/articles/components/ArticleGrid";
import { ArticleMetadata } from "@/features/articles/components/ArticleMetadata";
import { TagBadge } from "@/features/articles/components/TagBadge";

type ArticleDetailPageProps = {
  slug: string;
};

export function ArticleDetailPage({ slug }: ArticleDetailPageProps) {
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(article);

  return (
    <main className="bg-white">
      <article>
        <header className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(380px,0.7fr)] lg:px-12">
          <div className="flex flex-col justify-center gap-7">
            <div className="flex flex-wrap gap-2">
              <TagBadge label={article.category} />
              <TagBadge label={article.subcategory} />
              {article.tags.slice(0, 3).map((tag) => (
                <TagBadge key={tag} label={tag} />
              ))}
            </div>
            <div className="flex flex-col gap-5">
              <h1 className="mobile-text-lock break-words [font-family:var(--font-editorial-title)] text-2xl font-bold leading-none text-black sm:text-6xl lg:text-7xl">
                {article.title}
              </h1>
              <p className="[font-family:var(--font-editorial-sans)] text-2xl leading-9 text-black/78">
                {article.subtitle}
              </p>
              <ArticleMetadata article={article} includeCredits />
              <p className="max-w-3xl [font-family:var(--font-editorial-sans)] text-xl leading-9 text-black/70">
                {article.annotation}
              </p>
            </div>
          </div>
          <div className="relative min-h-[420px] overflow-hidden bg-black lg:min-h-[640px]">
            <Image
              alt=""
              className="object-cover grayscale"
              fill
              priority
              sizes="(min-width: 1024px) 38vw, 100vw"
              src={article.coverImage}
            />
          </div>
        </header>

        <section className="border-t border-black px-5 py-14 sm:px-8 lg:px-12">
          <ArticleBody blocks={article.body} />
        </section>

        <footer className="mx-auto flex max-w-3xl flex-col gap-6 border-t border-black px-5 py-10 sm:px-0">
          <p className="[font-family:var(--font-editorial-body-sans)] text-sm italic leading-7 text-black/62">
            Editor note: {article.editorNote}
          </p>
          {/* TODO: Connect this local count to real article analytics when persistence is added. */}
          <p className="[font-family:var(--font-editorial-body-sans)] text-sm italic text-black/62">
            {article.readingCount.toLocaleString()} readings
          </p>
        </footer>
      </article>

      <section className="mx-auto max-w-[1440px] border-t border-black px-5 py-14 sm:px-8 lg:px-12">
        <div className="mb-8 border-b border-black pb-4">
          <h2 className="[font-family:var(--font-editorial-title)] text-4xl font-bold text-black sm:text-5xl">
            Related Articles
          </h2>
        </div>
        <ArticleGrid
          articles={relatedArticles}
          emptyDescription="New related stories will appear here as the magazine grows."
          emptyTitle="No related articles yet"
        />
      </section>
    </main>
  );
}
