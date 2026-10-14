import type { Metadata } from "next";

import { hasActiveArticleFilters } from "@/features/articles/server/article-filter-params";
import {
  listPublishedArticles,
  type PublishedArticleFilters,
} from "@/features/articles/server/article-queries";
import { buildCategoryMetadata } from "@/features/categories/seo/category-seo";
import type { CategoryConfig } from "@/features/categories/types/category.types";

/**
 * Metadata for a section page, deciding indexability from live data: a section
 * without any published article, or a filtered view of it, is `noindex`.
 */
export async function getCategoryListingMetadata(
  category: CategoryConfig,
  filters: PublishedArticleFilters,
): Promise<Metadata> {
  const filtered = hasActiveArticleFilters(filters);
  // Only look for articles when the answer matters (an unfiltered, would-be
  // indexable page); filtered views are noindex regardless.
  const empty = filtered
    ? false
    : (await listPublishedArticles({ category: category.name, limit: 1 }))
        .length === 0;

  return buildCategoryMetadata(category, { filtered, empty });
}
