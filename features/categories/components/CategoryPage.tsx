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
      <section className="mx-auto flex max-w-[1440px] flex-col gap-10 px-5 py-14 sm:px-8 lg:px-12">
        <div className="max-w-3xl border-b border-black pb-8">
          <h1 className="[font-family:var(--font-editorial-title)] text-6xl font-bold leading-none text-black sm:text-7xl">
            {category.name}
          </h1>
          <p className="mt-5 [font-family:var(--font-editorial-sans)] text-lg leading-8 text-black/68">
            {category.description}
          </p>
        </div>
        <ArticleExplorer
          filters={filters}
          fixedCategory={category.name}
          title={`${category.name} Articles`}
        />
      </section>
    </main>
  );
}
