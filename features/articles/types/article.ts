export const articleStatusValues = ["draft", "published"] as const;

export type ArticleStatus = (typeof articleStatusValues)[number];

export type TiptapTextAlign = "left" | "center" | "right";

export const articleImageAlignValues = ["left", "center", "right"] as const;

/** Horizontal placement of an inline article-body image. Cover images are unaffected. */
export type ArticleImageAlign = (typeof articleImageAlignValues)[number];

export function normalizeArticleImageAlign(value: unknown): ArticleImageAlign {
  return articleImageAlignValues.includes(value as ArticleImageAlign)
    ? (value as ArticleImageAlign)
    : "center";
}

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
      type: "strike";
    }
  | {
      type: "link";
      attrs?: {
        href?: string;
        target?: string | null;
        rel?: string | null;
        class?: string | null;
      };
    };

export type TiptapNode = {
  type: string;
  attrs?: {
    level?: number;
    textAlign?: TiptapTextAlign | null;
    href?: string;
    target?: string | null;
    rel?: string | null;
    class?: string | null;
    start?: number;
    /** Inline image source. Always a stored blob URL, never base64. */
    src?: string;
    alt?: string | null;
    title?: string | null;
    align?: ArticleImageAlign | null;
    /** Natural pixel dimensions, recorded so rendering can reserve space. */
    width?: number | null;
    height?: number | null;
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
  /** Development-fixture hint. Production feature selection falls back to popularity. */
  featured?: boolean;
};

export type ArticleInput = {
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

export type ArticleFormValues = {
  title: string;
  slug: string;
  category: string;
  author: string;
  description: string;
  coverImage: string;
  coverImageAlt: string;
  tags: string;
  status: ArticleStatus;
  publishedAt: string;
  contentJson: TiptapDocument;
};

export type ArticleFieldErrors = Partial<
  Record<keyof ArticleFormValues, string>
>;

export type ArticleFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors: ArticleFieldErrors;
};

export const emptyTiptapDocument: TiptapDocument = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
};

export const emptyArticleFormValues: ArticleFormValues = {
  title: "",
  slug: "",
  category: "Beauty",
  author: "",
  description: "",
  coverImage: "",
  coverImageAlt: "",
  tags: "",
  status: "draft",
  publishedAt: "",
  contentJson: emptyTiptapDocument,
};

export const initialArticleFormState: ArticleFormState = {
  status: "idle",
  fieldErrors: {},
};

export function getArticleFormValues(article: Article): ArticleFormValues {
  return {
    title: article.title,
    slug: article.slug,
    category: article.category,
    author: article.author,
    description: article.description ?? "",
    coverImage: article.coverImage ?? "",
    coverImageAlt: article.coverImageAlt ?? "",
    tags: article.tags.join(", "),
    status: article.status,
    publishedAt: article.publishedAt
      ? toLocalDateTimeInputValue(article.publishedAt)
      : "",
    contentJson: isTiptapDocumentShape(article.contentJson)
      ? article.contentJson
      : emptyTiptapDocument,
  };
}

function isTiptapDocumentShape(value: unknown): value is TiptapDocument {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    (value as { type?: unknown }).type === "doc" &&
    Array.isArray((value as { content?: unknown }).content)
  );
}

function toLocalDateTimeInputValue(value: Date) {
  const offset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}
