import Link from "next/link";

import { ArticleCard } from "@/features/articles/components/ArticleCard";
import { getArticlesByCategory } from "@/features/articles/server/articles";
import { categoryConfigs } from "@/features/categories/data/categories";

export function CategorySections() {
  return (
    <section className="flex flex-col gap-14">
      <div className="border-b border-black pb-4">
        <h2 className="[font-family:var(--font-editorial-title)] text-4xl font-bold text-black sm:text-5xl">
          Sections
        </h2>
      </div>
      {categoryConfigs.map((category) => {
        const categoryArticles = getArticlesByCategory(category.name).slice(0, 3);

        return (
          <section className="grid gap-8 lg:grid-cols-[240px_1fr]" key={category.slug}>
            <div className="flex flex-col gap-4">
              <h3 className="[font-family:var(--font-editorial-title)] text-4xl font-bold text-black">
                <Link href={category.href}>{category.name}</Link>
              </h3>
              {category.subcategories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {category.subcategories.map((subcategory) => (
                    <span
                      className="border border-black/15 px-2 py-1 [font-family:var(--font-editorial-sans)] text-xs uppercase text-black/70"
                      key={subcategory}
                    >
                      {subcategory}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="grid gap-7 md:grid-cols-3">
              {categoryArticles.length > 0 ? (
                categoryArticles.map((article) => (
                  <ArticleCard article={article} compact key={article.id} />
                ))
              ) : (
                <div className="border-y border-black/15 py-10 [font-family:var(--font-editorial-sans)] text-sm text-black/62 md:col-span-3">
                  No published articles in this section yet.
                </div>
              )}
            </div>
          </section>
        );
      })}
    </section>
  );
}
