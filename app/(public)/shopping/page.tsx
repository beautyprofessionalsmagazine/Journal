import { ShoppingPage } from "@/features/shopping";
import {
  parseArticleFilters,
  type ArticlePageSearchParams,
} from "@/features/articles/server/article-filter-params";

type ShoppingRouteProps = {
  searchParams: Promise<ArticlePageSearchParams>;
};

export default async function Page({ searchParams }: ShoppingRouteProps) {
  return <ShoppingPage filters={parseArticleFilters(await searchParams)} />;
}
