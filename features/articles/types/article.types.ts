import type { CategoryName } from "@/features/categories/types/category.types";

export type ArticleStatus = "draft" | "published";

export type ArticleCategory = CategoryName;

export type ArticleBodyBlock =
  | {
      type: "heading";
      text: string;
    }
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "question";
      text: string;
    }
  | {
      type: "answer";
      text: string;
    }
  | {
      type: "pullQuote";
      text: string;
    };

export type Article = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  annotation: string;
  author: string;
  publishedAt: string;
  photographer: string;
  editorNote: string;
  category: ArticleCategory;
  subcategory: string;
  tags: string[];
  coverImage: string;
  body: ArticleBodyBlock[];
  pullQuotes: string[];
  status: ArticleStatus;
  featured: boolean;
  readingCount: number;
  createdAt: string;
  updatedAt: string;
};
