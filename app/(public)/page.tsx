import { HomePage } from "@/features/home";
import {
  parseArticleFilters,
  type ArticlePageSearchParams,
} from "@/features/articles/server/article-filter-params";

type HomeRouteProps = {
  searchParams: Promise<ArticlePageSearchParams>;
};

export default async function Page({ searchParams }: HomeRouteProps) {
  return <HomePage filters={parseArticleFilters(await searchParams)} />;
}
