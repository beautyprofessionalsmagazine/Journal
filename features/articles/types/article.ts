export const articleStatusValues = ["draft", "published"] as const;

export type ArticleStatus = (typeof articleStatusValues)[number];

export type TiptapTextAlign = "left" | "center" | "right";

export type TiptapMark =
  | {
      type: "bold";
    }
  | {
      type: "italic";
    }
  | {
      type: "underline";
    }
  | {
      type: "link";
      attrs?: {
        href?: string;
        target?: string | null;
        rel?: string | null;
      };
    };

export type TiptapNode = {
  type: string;
  attrs?: {
    level?: number;
    textAlign?: TiptapTextAlign;
    href?: string;
    target?: string | null;
    rel?: string | null;
  };
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
};

export type TiptapDocument = {
  type: "doc";
  content: TiptapNode[];
};

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
  coverImage?: string | null;
  coverImageAlt?: string | null;
  tags?: string[] | string | null;
  status: ArticleStatus;
  publishedAt?: Date | string | null;
  contentJson?: TiptapDocument | string | null;
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
  contentJson: TiptapDocument;
};

export type CreateArticleFieldErrors = Partial<
  Record<keyof CreateArticleFormValues | "coverImage", string>
>;

export type CreateArticleFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors: CreateArticleFieldErrors;
};

export const emptyTiptapDocument: TiptapDocument = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
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
  contentJson: emptyTiptapDocument,
};

export const initialCreateArticleFormState: CreateArticleFormState = {
  status: "idle",
  fieldErrors: {},
};
