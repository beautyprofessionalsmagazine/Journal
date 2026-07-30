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
    <section className="mx-auto max-w-[1440px] bg-white px-5 py-14 sm:px-8 lg:px-12">
      <ArticleExplorer
        excludeId={featuredArticle?.id}
        filters={filters}
      />
    </section>
  );
}
