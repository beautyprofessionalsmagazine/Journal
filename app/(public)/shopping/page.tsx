import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCategoryByName, getCategoryListingMetadata } from "@/features/categories";
import { ShoppingPage } from "@/features/shopping";
import {
  parseArticleFilters,
  type ArticlePageSearchParams,
} from "@/features/articles/server/article-filter-params";

type ShoppingRouteProps = {
  searchParams: Promise<ArticlePageSearchParams>;
};

export async function generateMetadata({
  searchParams,
}: ShoppingRouteProps): Promise<Metadata> {
  const category = getCategoryByName("Shopping");

  if (!category) {
    notFound();
  }

  return getCategoryListingMetadata(
    category,
    parseArticleFilters(await searchParams),
  );
}

export default async function Page({ searchParams }: ShoppingRouteProps) {
  return <ShoppingPage filters={parseArticleFilters(await searchParams)} />;
}
