import { notFound } from "next/navigation";

import { ArticleExplorer } from "@/features/articles/components/ArticleExplorer";
import type { PublishedArticleFilters } from "@/features/articles/server/article-queries";
import { getCategoryBySlug } from "@/features/categories/server/categories";

type CategoryPageProps = {
  filters?: PublishedArticleFilters;
  slug: string;
};

export function CategoryPage({ filters, slug }: CategoryPageProps) {
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return (
    <main className="bg-white">
      <section className="site-container py-[var(--section-space)]">
        <header className="reveal grid gap-6 border-b border-black pb-[clamp(2rem,5vw,4rem)] lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="editorial-kicker mb-3 text-black/45">
              Journal section
            </p>
            <h1 className="page-title">
            {category.name}
            </h1>
          </div>
          <p className="max-w-xl text-[clamp(1rem,1.8vw,1.25rem)] leading-8 text-black/64 lg:justify-self-end">
            {category.description}
          </p>
        </header>
        <div className="mt-[clamp(3rem,6vw,6rem)]">
          <ArticleExplorer
            filters={filters}
            fixedCategory={category.name}
            title={`${category.name} Stories`}
          />
        </div>
      </section>
    </main>
  );
}
