import type { ArticleCategory } from "@/features/articles/types/article.types";

export type CategoryConfig = {
  name: ArticleCategory;
  slug: string;
  subcategories: string[];
};

export const categoryConfigs: CategoryConfig[] = [
  {
    name: "Fashion",
    slug: "fashion",
    subcategories: [
      "Celebrity Style",
      "Street Style",
      "Models",
      "Designers",
      "Trends",
      "Sustainability",
    ],
  },
  {
    name: "Runway",
    slug: "runway",
    subcategories: [],
  },
  {
    name: "Shopping",
    slug: "shopping",
    subcategories: [],
  },
  {
    name: "Beauty",
    slug: "beauty",
    subcategories: [
      "Celebrity Beauty",
      "Hair",
      "Makeup",
      "Nails",
      "Wellness",
      "Skin",
    ],
  },
  {
    name: "Culture",
    slug: "culture",
    subcategories: [
      "Opinion",
      "TV & Movies",
      "Music",
      "Arts",
      "Books",
      "News",
      "Sports",
    ],
  },
  {
    name: "Living",
    slug: "living",
    subcategories: ["Homes", "Travel"],
  },
];

export const categorySlugs = categoryConfigs.map((category) => category.slug);
