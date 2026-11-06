import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CategoryPage,
  getCategoryBySlug,
  getCategoryListingMetadata,
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

// The section list is fixed configuration, so any other slug is a hard 404
// without rendering the page or touching the database.
export const dynamicParams = false;

export async function generateMetadata({
  params,
  searchParams,
}: CategoryRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return getCategoryListingMetadata(
    category,
    parseArticleFilters(await searchParams),
  );
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
