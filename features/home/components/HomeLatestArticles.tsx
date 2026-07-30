import { ArticleExplorer } from "@/features/articles/components/ArticleExplorer";
import {
  getFeaturedArticle,
  listPublishedArticles,
} from "@/features/articles/server/article-queries";

export async function HomeLatestArticles() {
  const featuredArticle = await getFeaturedArticle();
  const latestArticles = await listPublishedArticles({
    excludeId: featuredArticle?.id,
  });

  return (
    <section className="mx-auto max-w-[1440px] bg-white px-5 py-14 sm:px-8 lg:px-12">
      <ArticleExplorer articles={latestArticles} />
    </section>
  );
}
