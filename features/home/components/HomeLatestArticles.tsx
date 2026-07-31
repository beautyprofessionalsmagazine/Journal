import { ArticleExplorer } from "@/features/articles/components/ArticleExplorer";
import {
  getFeaturedArticle,
  type PublishedArticleFilters,
} from "@/features/articles/server/article-queries";

type HomeLatestArticlesProps = {
  filters?: PublishedArticleFilters;
};

export async function HomeLatestArticles({
  filters,
}: HomeLatestArticlesProps) {
  const featuredArticle = await getFeaturedArticle();

  return (
    <section className="bg-white py-[var(--section-space)]">
      <div className="site-container">
        <ArticleExplorer
          editorial
          excludeId={featuredArticle?.id}
          filters={filters}
          title="Latest Stories"
        />
      </div>
    </section>
  );
}
