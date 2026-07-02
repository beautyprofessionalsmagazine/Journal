import { HomeFeaturedCategories } from "@/features/home/components/HomeFeaturedCategories";
import { HomeHero } from "@/features/home/components/HomeHero";
import { HomeLatestArticles } from "@/features/home/components/HomeLatestArticles";

export function HomePage() {
  return (
    <main>
      <HomeHero />
      <HomeLatestArticles />
      <HomeFeaturedCategories />
    </main>
  );
}
