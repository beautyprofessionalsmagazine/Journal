export const articleStatusValues = ["draft", "published"] as const;

export type ArticleStatus = (typeof articleStatusValues)[number];

export type Article = {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  description: string | null;
  coverImage: string | null;
  coverImageAlt: string | null;
  tags: string[];
  status: ArticleStatus;
  publishedAt: Date | null;
  views: number;
  contentJson: unknown | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateArticleInput = {
  title: string;
  slug: string;
  category: string;
  author: string;
  description?: string | null;
  coverImage?: File | null;
  coverImageAlt?: string | null;
  tags?: string[] | string | null;
  status: ArticleStatus;
  publishedAt?: Date | string | null;
  contentJson?: unknown | string | null;
};

export type CreateArticleFormValues = {
  title: string;
  slug: string;
  category: string;
  author: string;
  description: string;
  coverImageAlt: string;
  tags: string;
  status: ArticleStatus;
  contentJson: string;
};

export type CreateArticleFieldErrors = Partial<
  Record<keyof CreateArticleFormValues | "coverImage", string>
>;

export type CreateArticleFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors: CreateArticleFieldErrors;
};

export const emptyCreateArticleFormValues: CreateArticleFormValues = {
  title: "",
  slug: "",
  category: "Beauty",
  author: "",
  description: "",
  coverImageAlt: "",
  tags: "",
  status: "draft",
  contentJson: "",
};

export const initialCreateArticleFormState: CreateArticleFormState = {
  status: "idle",
  fieldErrors: {},
};
