import {
  ArticleExplorer,
  ArticleHero,
  CategorySections,
  getFeaturedArticle,
  getPublishedArticles,
} from "@/features/articles";
import { PublicLayout } from "@/shared/components/PublicLayout";

export default function HomePage() {
  const featuredArticle = getFeaturedArticle();
  const latestArticles = getPublishedArticles().filter(
    (article) => article.id !== featuredArticle?.id,
  );

  return (
    <PublicLayout>
      <main>
        {featuredArticle ? (
          <ArticleHero article={featuredArticle} />
        ) : (
          <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12">
            <div className="border-y border-black/15 py-16 text-center">
              <h1 className="[font-family:var(--font-editorial-title)] text-5xl font-bold">
                Beauty Professionals Magazine
              </h1>
              <p className="mt-4 [font-family:var(--font-editorial-sans)] text-sm text-black/62">
                No featured article has been selected yet.
              </p>
            </div>
          </section>
        )}
        <section className="mx-auto max-w-[1440px] bg-white px-5 py-14 sm:px-8 lg:px-12">
          <ArticleExplorer articles={latestArticles} />
        </section>
        <section className="mx-auto max-w-[1440px] bg-white px-5 pb-20 sm:px-8 lg:px-12">
          <CategorySections />
        </section>
      </main>
    </PublicLayout>
  );
}
