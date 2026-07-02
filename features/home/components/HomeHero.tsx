import { ArticleHero } from "@/features/articles/components/ArticleHero";
import { getFeaturedArticle } from "@/features/articles/server/articles";

export function HomeHero() {
  const featuredArticle = getFeaturedArticle();

  if (!featuredArticle) {
    return (
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
    );
  }

  return <ArticleHero article={featuredArticle} />;
}
