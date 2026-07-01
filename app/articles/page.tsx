import type { Metadata } from "next";

import { ArticleExplorer, getPublishedArticles } from "@/features/articles";
import { PublicLayout } from "@/shared/components/PublicLayout";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Search and filter Beauty Professionals Magazine articles by category, tag, author, and popularity.",
};

export default function ArticlesPage() {
  return (
    <PublicLayout>
      <main className="bg-white">
        <section className="mx-auto flex max-w-[1440px] flex-col gap-10 px-5 py-14 sm:px-8 lg:px-12">
          <div className="max-w-3xl border-b border-black pb-8">
            <h1 className="[font-family:var(--font-editorial-title)] text-6xl font-bold leading-none text-black sm:text-7xl">
              Articles
            </h1>
            <p className="mt-5 [font-family:var(--font-editorial-sans)] text-lg leading-8 text-black/68">
              Read the latest interviews, professional notes, culture stories,
              and style coverage.
            </p>
          </div>
          <ArticleExplorer articles={getPublishedArticles()} title="All Articles" />
        </section>
      </main>
    </PublicLayout>
  );
}
