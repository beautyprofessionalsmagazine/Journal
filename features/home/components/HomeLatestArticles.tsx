import { ArticleExplorer } from "@/features/articles/components/ArticleExplorer";
import {
  getFeaturedArticle,
  getPublishedArticles,
} from "@/features/articles/server/articles";

export function HomeLatestArticles() {
  const featuredArticle = getFeaturedArticle();
  const latestArticles = getPublishedArticles().filter(
    (article) => article.id !== featuredArticle?.id,
  );

  return (
    <section className="mx-auto max-w-[1440px] bg-white px-5 py-14 sm:px-8 lg:px-12">
      <ArticleExplorer articles={latestArticles} />
    </section>
  );
}
