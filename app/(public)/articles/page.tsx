import type { Metadata } from "next";

import { ArticlesPage } from "@/features/articles";
import {
  parseArticleFilters,
  type ArticlePageSearchParams,
} from "@/features/articles/server/article-filter-params";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Search and filter Beauty Professionals Magazine articles by category, tag, author, and popularity.",
};

type ArticlesRouteProps = {
  searchParams: Promise<ArticlePageSearchParams>;
};

export default async function Page({ searchParams }: ArticlesRouteProps) {
  return <ArticlesPage filters={parseArticleFilters(await searchParams)} />;
}
