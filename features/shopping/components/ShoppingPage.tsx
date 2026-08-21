import { ArticleExplorer } from "@/features/articles/components/ArticleExplorer";
import type { PublishedArticleFilters } from "@/features/articles/server/article-queries";
import { getCategoryByName } from "@/features/categories/server/categories";

type ShoppingPageProps = {
  filters?: PublishedArticleFilters;
};

export function ShoppingPage({ filters }: ShoppingPageProps) {
  const shoppingCategory = getCategoryByName("Shopping");

  return (
    <main className="bg-white">
      <section className="site-container py-[var(--section-space)]">
        <header className="reveal grid gap-6 border-b border-black pb-[clamp(2rem,5vw,4rem)] lg:grid-cols-[1.2fr_0.8fr] lg:items-end" suppressHydrationWarning>
          <div>
            <p className="editorial-kicker mb-3 text-black/45">
              Considered objects
            </p>
            <h1 className="page-title">
            Shopping
            </h1>
          </div>
          <p className="max-w-xl text-[clamp(1rem,1.8vw,1.25rem)] leading-8 text-black/64 lg:justify-self-end">
            {shoppingCategory?.description}
          </p>
        </header>
        <div className="mt-[clamp(3rem,6vw,6rem)]">
          <ArticleExplorer
            filters={filters}
            fixedCategory="Shopping"
            title="Shopping Stories"
          />
        </div>
      </section>
    </main>
  );
}
