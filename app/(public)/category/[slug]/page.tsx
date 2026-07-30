import type { Metadata } from "next";

import {
  CategoryPage,
  getCategoryMetadata,
  getDynamicCategoryRouteParams,
} from "@/features/categories";
import {
  parseArticleFilters,
  type ArticlePageSearchParams,
} from "@/features/articles/server/article-filter-params";

type CategoryRouteProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<ArticlePageSearchParams>;
};

export function generateStaticParams() {
  return getDynamicCategoryRouteParams();
}

export async function generateMetadata({
  params,
}: CategoryRouteProps): Promise<Metadata> {
  const { slug } = await params;

  return getCategoryMetadata(slug);
}

export default async function Page({
  params,
  searchParams,
}: CategoryRouteProps) {
  const { slug } = await params;

  return (
    <CategoryPage
      filters={parseArticleFilters(await searchParams)}
      slug={slug}
    />
  );
}
