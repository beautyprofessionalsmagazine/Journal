import Link from "next/link";

import { ArticleCard } from "@/features/articles/components/ArticleCard";
import { listPublishedArticles } from "@/features/articles/server/article-queries";
import { categoryConfigs } from "@/features/categories/data/categories";

export async function CategorySections() {
  const sections = await Promise.all(
    categoryConfigs.map(async (category) => ({
      category,
      articles: await listPublishedArticles({
        category: category.name,
        limit: 3,
      }),
    })),
  );

  return (
    <section>
      <div className="flex flex-col gap-4 border-b border-black pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="editorial-kicker mb-2 text-black/45">Browse by desk</p>
          <h2 className="section-title">Journal Sections</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-black/58">
          Reporting organized around the working worlds of beauty, fashion,
          culture, shopping, and life beyond the studio.
        </p>
      </div>
      <div>
        {sections.map(({ category, articles }, sectionIndex) => (
          <section
            className="grid gap-8 border-b border-black/25 py-[clamp(2.5rem,6vw,5rem)] lg:grid-cols-[minmax(12rem,0.55fr)_minmax(0,1.8fr)]"
            key={category.slug}
          >
            <div className="flex flex-col items-start gap-5">
              <p className="editorial-kicker text-black/42">
                0{sectionIndex + 1}
              </p>
              <h3 className="[font-family:var(--font-editorial-title)] text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[0.9] tracking-[-0.04em]">
                <Link className="focus-ring hover:underline" href={category.href}>
                  {category.name}
                </Link>
              </h3>
              {category.subcategories.length > 0 ? (
                <div className="flex max-w-sm flex-wrap gap-x-3 gap-y-1">
                  {category.subcategories.map((subcategory) => (
                    <Link
                      className="focus-ring inline-flex min-h-11 items-center text-xs uppercase tracking-[0.06em] text-black/58 hover:text-black"
                      href={`${category.href}?tag=${encodeURIComponent(subcategory)}`}
                      key={subcategory}
                    >
                      {subcategory}
                    </Link>
                  ))}
                </div>
              ) : null}
              <Link className="button-secondary" href={category.href}>
                View section
              </Link>
            </div>
            <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {articles.length > 0 ? (
                articles.map((article) => (
                  <ArticleCard article={article} compact key={article.id} />
                ))
              ) : (
                <div className="border-y border-black/15 py-10 [font-family:var(--font-editorial-sans)] text-sm text-black/62 md:col-span-3">
                  No published articles in this section yet.
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
