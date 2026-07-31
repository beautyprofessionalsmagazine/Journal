import type { CategoryConfig } from "@/features/categories/types/category.types";

export const categoryConfigs: CategoryConfig[] = [
  {
    name: "Fashion",
    slug: "fashion",
    description:
      "Celebrity style, street style, models, designers, trends, and sustainability with a professional eye.",
    subcategories: [
      "Celebrity Style",
      "Street Style",
      "Models",
      "Designers",
      "Trends",
      "Sustainability",
    ],
    href: "/category/fashion",
    pageKind: "dynamic",
  },
  {
    name: "Runway",
    slug: "runway",
    description:
      "Backstage beauty notes, runway ideas, and the details that translate into professional practice.",
    subcategories: [],
    href: "/category/runway",
    pageKind: "dynamic",
  },
  {
    name: "Shopping",
    slug: "shopping",
    description:
      "Tools, products, workwear, and objects chosen for usefulness, quality, and everyday studio life.",
    subcategories: [],
    href: "/shopping",
    pageKind: "standalone",
  },
  {
    name: "Beauty",
    slug: "beauty",
    description:
      "Hair, makeup, nails, wellness, skin, and professional interviews from the beauty industry.",
    subcategories: [
      "Celebrity Beauty",
      "Hair",
      "Makeup",
      "Nails",
      "Wellness",
      "Skin",
    ],
    href: "/category/beauty",
    pageKind: "dynamic",
  },
  {
    name: "Culture",
    slug: "culture",
    description:
      "Opinion, TV and movies, music, arts, books, news, and sports through an editorial beauty lens.",
    subcategories: [
      "Opinion",
      "TV & Movies",
      "Music",
      "Arts",
      "Books",
      "News",
      "Sports",
    ],
    href: "/category/culture",
    pageKind: "dynamic",
  },
  {
    name: "Living",
    slug: "living",
    description:
      "Homes, travel, education trips, and the practical life surrounding beauty work.",
    subcategories: ["Homes", "Travel"],
    href: "/category/living",
    pageKind: "dynamic",
  },
];
