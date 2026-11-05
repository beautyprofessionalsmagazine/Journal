export type CategoryName =
  | "Fashion"
  | "Runway"
  | "Shopping"
  | "Beauty"
  | "Culture"
  | "Living";

export type CategorySlug =
  | "fashion"
  | "runway"
  | "shopping"
  | "beauty"
  | "culture"
  | "living";

export type DynamicCategorySlug =
  | "fashion"
  | "runway"
  | "beauty"
  | "culture"
  | "living";

export type CategoryConfig = {
  name: CategoryName;
  slug: CategorySlug;
  description: string;
  /** <title> for the section page (before the brand suffix); falls back to `name`. */
  seoTitle?: string;
  subcategories: string[];
  href: string;
  pageKind: "dynamic" | "standalone";
};
