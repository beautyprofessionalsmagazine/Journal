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
  subcategories: string[];
  href: string;
  pageKind: "dynamic" | "standalone";
};
