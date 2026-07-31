import { HomeFeaturedCategories } from "@/features/home/components/HomeFeaturedCategories";
import { HomeHero } from "@/features/home/components/HomeHero";
import { HomeLatestArticles } from "@/features/home/components/HomeLatestArticles";
import type { PublishedArticleFilters } from "@/features/articles/server/article-queries";

type HomePageProps = {
  filters?: PublishedArticleFilters;
};

export function HomePage({ filters }: HomePageProps) {
  return (
    <main>
      <HomeHero />
      <HomeLatestArticles filters={filters} />
      <HomeFeaturedCategories />
    </main>
  );
}
