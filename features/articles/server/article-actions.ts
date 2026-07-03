"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";

import { articlesTable } from "@/features/articles/db/article-schema";
import { getArticleBySlug } from "@/features/articles/server/article-queries";
import type {
  Article,
  CreateArticleFieldErrors,
  CreateArticleFormState,
  CreateArticleInput,
} from "@/features/articles/types/article";
import {
  getCreateArticleInputFromFormData,
  normalizeSlug,
  validateCreateArticleInput,
} from "@/features/articles/validation/article-validation";
import { db } from "@/shared/lib/db";

class ArticleActionError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: CreateArticleFieldErrors = {},
  ) {
    super(message);
    this.name = "ArticleActionError";
  }
}

export async function createArticle(input: CreateArticleInput): Promise<Article> {
  const parsedInput = validateCreateArticleInput(input);

  if (!parsedInput.success) {
    throw new ArticleActionError(
      "Please fix the highlighted fields and try again.",
      getFieldErrors(parsedInput.error),
    );
  }

  const articleInput = parsedInput.data;
  const normalizedSlug = normalizeSlug(articleInput.slug);
  const existingArticle = await getArticleBySlug(normalizedSlug);

  if (existingArticle) {
    throw new ArticleActionError("That slug is already in use.", {
      slug: "This slug is already in use.",
    });
  }

  const coverImageUrl = articleInput.coverImage
    ? await uploadCoverImage(normalizedSlug, articleInput.coverImage)
    : null;

  const publishedAt =
    articleInput.status === "published"
      ? articleInput.publishedAt ?? new Date()
      : null;

  try {
    const [article] = await db
      .insert(articlesTable)
      .values({
        title: articleInput.title,
        slug: normalizedSlug,
        category: articleInput.category,
        author: articleInput.author,
        description: articleInput.description ?? null,
        coverImage: coverImageUrl,
        coverImageAlt: coverImageUrl ? articleInput.coverImageAlt ?? null : null,
        tags: articleInput.tags,
        status: articleInput.status,
        publishedAt,
        views: 0,
        contentJson: articleInput.contentJson ?? null,
      })
      .returning();

    return article;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new ArticleActionError("That slug is already in use.", {
        slug: "This slug is already in use.",
      });
    }

    throw error;
  }
}

export async function createArticleAction(
  _previousState: CreateArticleFormState,
  formData: FormData,
): Promise<CreateArticleFormState> {
  try {
    const article = await createArticle(getCreateArticleInputFromFormData(formData));

    revalidatePath("/admin/articles");
    revalidatePath("/admin/articles/create");
    revalidatePath(`/admin/articles/${article.id}/edit`);
    redirect(`/admin/articles/${article.id}/edit`);
  } catch (error) {
    if (error instanceof ArticleActionError) {
      return {
        status: "error",
        message: error.message,
        fieldErrors: error.fieldErrors,
      };
    }

    if (error instanceof ZodError) {
      return {
        status: "error",
        message: "Please fix the highlighted fields and try again.",
        fieldErrors: getFieldErrors(error),
      };
    }

    return {
      status: "error",
      message: "Unable to create the article right now. Please try again.",
      fieldErrors: {},
    };
  }
}

async function uploadCoverImage(slug: string, file: File) {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!blobToken) {
    throw new ArticleActionError(
      "BLOB_READ_WRITE_TOKEN is missing. Add it before uploading cover images.",
    );
  }

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const fileName = `articles/${slug}-${Date.now()}.${extension}`;
  const uploadedFile = await put(fileName, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
    token: blobToken,
  });

  return uploadedFile.url;
}

function getFieldErrors(error: ZodError) {
  const flattened = error.flatten().fieldErrors as Record<
    string,
    string[] | undefined
  >;
  const fieldErrors: CreateArticleFieldErrors = {};

  for (const [fieldName, messages] of Object.entries(flattened)) {
    const firstMessage = messages?.[0];

    if (firstMessage) {
      fieldErrors[fieldName as keyof CreateArticleFieldErrors] = firstMessage;
    }
  }

  return fieldErrors;
}
