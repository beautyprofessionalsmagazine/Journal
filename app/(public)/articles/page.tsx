import type { Metadata } from "next";

import { ArticlesPage } from "@/features/articles";
import {
  hasActiveArticleFilters,
  parseArticleFilters,
  type ArticlePageSearchParams,
} from "@/features/articles/server/article-filter-params";
import { buildPageMetadata } from "@/shared/seo/metadata";

type ArticlesRouteProps = {
  searchParams: Promise<ArticlePageSearchParams>;
};

export async function generateMetadata({
  searchParams,
}: ArticlesRouteProps): Promise<Metadata> {
  const filtered = hasActiveArticleFilters(
    parseArticleFilters(await searchParams),
  );

  return buildPageMetadata({
    title: "Articles: Interviews, Professional Notes & Culture",
    description:
      "Read the latest interviews, professional notes, culture stories, and style coverage from Beauty Professionals Magazine.",
    // Search, tag, category, and sort views are subsets of this page: they are
    // kept out of the index and declare no canonical of their own.
    path: filtered ? undefined : "/articles",
    noindex: filtered,
  });
}

export default async function Page({ searchParams }: ArticlesRouteProps) {
  return <ArticlesPage filters={parseArticleFilters(await searchParams)} />;
}
