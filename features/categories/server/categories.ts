import { categoryConfigs } from "@/features/categories/data/categories";
import type {
  CategoryConfig,
  CategoryName,
} from "@/features/categories/types/category.types";

export function getCategoryConfigs() {
  return categoryConfigs;
}

export function getDynamicCategories() {
  return categoryConfigs.filter((category) => category.pageKind === "dynamic");
}

export function getDynamicCategoryRouteParams() {
  return getDynamicCategories().map((category) => ({ slug: category.slug }));
}

export function getCategoryBySlug(slug: string) {
  return getDynamicCategories().find((category) => category.slug === slug);
}

export function getCategoryByName(name: CategoryName) {
  return categoryConfigs.find((category) => category.name === name);
}

export function isStandaloneCategory(category: CategoryConfig) {
  return category.pageKind === "standalone";
}
