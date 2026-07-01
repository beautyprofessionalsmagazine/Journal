import { ArticleExplorer } from "@/features/articles/components/ArticleExplorer";
import { getArticlesByCategory } from "@/features/articles/lib/articles";
import type { ArticleCategory } from "@/features/articles/types/article.types";
import { PublicLayout } from "@/shared/components/PublicLayout";

type CategoryArticlePageProps = {
  category: ArticleCategory;
  description: string;
};

export function CategoryArticlePage({
  category,
  description,
}: CategoryArticlePageProps) {
  const articles = getArticlesByCategory(category);

  return (
    <PublicLayout>
      <main className="bg-white">
        <section className="mx-auto flex max-w-[1440px] flex-col gap-10 px-5 py-14 sm:px-8 lg:px-12">
          <div className="max-w-3xl border-b border-black pb-8">
            <h1 className="[font-family:var(--font-editorial-title)] text-6xl font-bold leading-none text-black sm:text-7xl">
              {category}
            </h1>
            <p className="mt-5 [font-family:var(--font-editorial-sans)] text-lg leading-8 text-black/68">
              {description}
            </p>
          </div>
          <ArticleExplorer
            articles={articles}
            initialCategory={category}
            title={`${category} Articles`}
          />
        </section>
      </main>
    </PublicLayout>
  );
}
