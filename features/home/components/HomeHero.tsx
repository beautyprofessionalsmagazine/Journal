import { ArticleHero } from "@/features/articles/components/ArticleHero";
import { getFeaturedArticle } from "@/features/articles/server/article-queries";

export async function HomeHero() {
  const featuredArticle = await getFeaturedArticle();

  if (!featuredArticle) {
    return (
      <section className="bg-white py-[var(--section-space)]">
        <div className="site-container">
          <div className="border-y border-black py-16 text-center">
          <h1 className="mx-auto max-w-4xl [font-family:var(--font-editorial-title)] text-[clamp(3rem,8vw,6.5rem)] font-bold leading-[0.9] tracking-[-0.045em]">
            Beauty Professionals Magazine
          </h1>
          <p className="mt-4 [font-family:var(--font-editorial-sans)] text-sm text-black/62">
            No featured article has been selected yet.
          </p>
        </div>
        </div>
      </section>
    );
  }

  return <ArticleHero article={featuredArticle} />;
}
