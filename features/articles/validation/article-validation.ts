import { z } from "zod";

import {
  articleStatusValues,
  type CreateArticleInput,
  type TiptapDocument,
  type TiptapNode,
} from "@/features/articles/types/article";

export const MAX_COVER_IMAGE_SIZE = 5 * 1024 * 1024;

export const ALLOWED_COVER_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createArticleInputSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required."),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required.")
      .transform(normalizeSlug)
      .refine((value) => slugPattern.test(value), {
        message: "Slug must use lowercase letters, numbers, and hyphens only.",
      }),
    category: z.string().trim().min(1, "Category is required."),
    author: z.string().trim().min(1, "Author is required."),
    description: z
      .string()
      .trim()
      .nullish()
      .transform((value) => toNullableString(value)),
    coverImage: z
      .string()
      .trim()
      .nullish()
      .transform((value) => toNullableString(value)),
    coverImageAlt: z
      .string()
      .trim()
      .nullish()
      .transform((value) => toNullableString(value)),
    tags: z
      .union([z.string(), z.array(z.string()), z.null(), z.undefined()])
      .transform((value) => parseTagsInput(value)),
    status: z.enum(articleStatusValues, {
      message: "Status must be draft or published.",
    }),
    publishedAt: z
      .union([z.string(), z.date(), z.null(), z.undefined()])
      .optional()
      .transform((value, context) => {
        const parsed = parsePublishedAt(value);

        if (value && !parsed) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Published date must be a valid date.",
          });

          return z.NEVER;
        }

        return parsed;
      }),
    contentJson: z
      .union([
        z.string(),
        z.record(z.string(), z.unknown()),
        z.null(),
        z.undefined(),
      ])
      .optional()
      .transform((value, context) => {
        try {
          return parseContentJson(value);
        } catch (error) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              error instanceof Error
                ? error.message
                : "Content JSON must be valid JSON.",
          });

          return z.NEVER;
        }
      }),
  })
  .superRefine((value, context) => {
    if (value.coverImage && !isValidUrl(value.coverImage)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["coverImage"],
        message: "Cover image URL is invalid. Please upload the image again.",
      });
    }

    if (!value.contentJson) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contentJson"],
        message: "Article body is required.",
      });

      return;
    }

    if (!isTiptapDocument(value.contentJson)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contentJson"],
        message: "Article body could not be processed. Please try again.",
      });
    }

    if (isTiptapDocument(value.contentJson) && !hasMeaningfulTiptapContent(value.contentJson)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contentJson"],
        message: "Article body is required.",
      });
    }
  });

export function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function parseTagsInput(value: string | string[] | null | undefined) {
  const source = Array.isArray(value) ? value.join(",") : value ?? "";

  return Array.from(
    new Set(
      source
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export function parsePublishedAt(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  const parsedDate = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

export function parseContentJson(value: unknown) {
  if (value == null) {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  return JSON.parse(normalizedValue);
}

export function isTiptapDocument(value: unknown): value is TiptapDocument {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TiptapDocument>;

  return candidate.type === "doc" && Array.isArray(candidate.content);
}

export function hasMeaningfulTiptapContent(document: TiptapDocument) {
  return document.content.some(hasMeaningfulTiptapNode);
}

export function getCreateArticleInputFromFormData(formData: FormData): CreateArticleInput {
  return {
    title: readString(formData, "title"),
    slug: readString(formData, "slug"),
    category: readString(formData, "category"),
    author: readString(formData, "author"),
    description: readString(formData, "description"),
    coverImage: readString(formData, "coverImage"),
    coverImageAlt: readString(formData, "coverImageAlt"),
    tags: readString(formData, "tags"),
    status: readString(formData, "status") as CreateArticleInput["status"],
    contentJson: readString(formData, "contentJson"),
  };
}

export function validateCreateArticleInput(input: CreateArticleInput) {
  return createArticleInputSchema.safeParse(input);
}

function readString(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);

  return typeof value === "string" ? value : "";
}

function toNullableString(value: string | null | undefined) {
  const normalizedValue = value?.trim();

  return normalizedValue ? normalizedValue : null;
}

function hasMeaningfulTiptapNode(node: TiptapNode): boolean {
  if (node.type === "text") {
    return Boolean(node.text?.trim());
  }

  if (!Array.isArray(node.content)) {
    return false;
  }

  return node.content.some(hasMeaningfulTiptapNode);
}

function isValidUrl(value: string) {
  try {
    return Boolean(new URL(value));
  } catch {
    return false;
  }
}
