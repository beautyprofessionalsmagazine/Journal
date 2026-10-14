import type { Metadata } from "next";

import type { CategoryConfig } from "@/features/categories/types/category.types";
import { pageJsonLd } from "@/shared/seo/json-ld";
import { buildPageMetadata } from "@/shared/seo/metadata";

export type CategoryListingState = {
  /** The URL carries a search, tag, or sort that narrows or reorders the list. */
  filtered: boolean;
  /** The section has no published article yet. */
  empty: boolean;
};

/**
 * Metadata for a section listing (`/category/[slug]` and `/shopping`).
 *
 * A section is indexable only in its plain form and only once it has an
 * article: filtered or re-sorted views and empty sections carry `noindex`,
 * and the sitemap leaves empty sections out to match.
 */
export function buildCategoryMetadata(
  category: CategoryConfig,
  state: CategoryListingState,
): Metadata {
  const noindex = state.filtered || state.empty;

  return buildPageMetadata({
    title: category.seoTitle ?? category.name,
    description: category.description,
    // A filtered view is not a page of its own: no canonical, only noindex.
    path: state.filtered ? undefined : category.href,
    noindex,
  });
}

/**
 * Structured data for a section page. There is deliberately no BreadcrumbList:
 * section pages show no visible breadcrumb trail, and structured data must
 * reflect what readers can see.
 */
export function getCategoryJsonLd(category: CategoryConfig) {
  return pageJsonLd({
    path: category.href,
    name: category.seoTitle ?? category.name,
    description: category.description,
    type: "CollectionPage",
  });
}
