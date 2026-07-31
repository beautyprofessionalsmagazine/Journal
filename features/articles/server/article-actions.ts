"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";

import { hasAdminSession } from "@/features/admin/server/admin-auth";
import { articlesTable } from "@/features/articles/db/article-schema";
import {
  getArticleById,
  getArticleBySlug,
} from "@/features/articles/server/article-queries";
import type {
  Article,
  ArticleFieldErrors,
  ArticleFormState,
  ArticleInput,
} from "@/features/articles/types/article";
import {
  getArticleFieldErrors,
  getArticleInputFromFormData,
  normalizeSlug,
  validateArticleInput,
} from "@/features/articles/validation/article-validation";
import { db } from "@/shared/lib/db";

class ArticleActionError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: ArticleFieldErrors = {},
  ) {
    super(message);
    this.name = "ArticleActionError";
  }
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  const parsedInput = validateArticleInput(input);

  if (!parsedInput.success) {
    throw new ArticleActionError(
      "Please fix the highlighted fields and try again.",
      getArticleFieldErrors(parsedInput.error),
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
        coverImage: articleInput.coverImage ?? null,
        coverImageAlt: articleInput.coverImage ? articleInput.coverImageAlt ?? null : null,
        tags: articleInput.tags,
        status: articleInput.status,
        publishedAt,
        views: 0,
        contentJson: articleInput.contentJson,
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

    throw new ArticleActionError(
      "Unable to save the article to the database. Please try again.",
    );
  }
}

export async function createArticleAction(
  _previousState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  let article: Article;

  try {
    article = await createArticle(getArticleInputFromFormData(formData));
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
        fieldErrors: getArticleFieldErrors(error),
      };
    }

    return {
      status: "error",
      message: "Unable to create the article right now. Please try again.",
      fieldErrors: {},
    };
  }

  revalidatePath("/admin/articles");
  revalidatePath("/admin/articles/create");
  revalidatePath(`/admin/articles/${article.id}/edit`);
  redirect(`/admin/articles/${article.id}/edit`);
}

export async function updateArticle(
  id: string,
  input: ArticleInput,
): Promise<Article> {
  const parsedInput = validateArticleInput(input);

  if (!parsedInput.success) {
    throw new ArticleActionError(
      "Please fix the highlighted fields and try again.",
      getArticleFieldErrors(parsedInput.error),
    );
  }

  const currentArticle = await getArticleById(id);

  if (!currentArticle) {
    throw new ArticleActionError("This article no longer exists.");
  }

  const articleInput = parsedInput.data;
  const normalizedSlug = normalizeSlug(articleInput.slug);
  const slugOwner = await getArticleBySlug(normalizedSlug);

  if (slugOwner && slugOwner.id !== id) {
    throw new ArticleActionError("That slug is already in use.", {
      slug: "This slug is already in use.",
    });
  }

  const publishedAt =
    articleInput.status === "published"
      ? articleInput.publishedAt ?? currentArticle.publishedAt ?? new Date()
      : null;

  try {
    const [article] = await db
      .update(articlesTable)
      .set({
        title: articleInput.title,
        slug: normalizedSlug,
        category: articleInput.category,
        author: articleInput.author,
        description: articleInput.description ?? null,
        coverImage: articleInput.coverImage ?? null,
        coverImageAlt: articleInput.coverImage
          ? articleInput.coverImageAlt ?? null
          : null,
        tags: articleInput.tags,
        status: articleInput.status,
        publishedAt,
        contentJson: articleInput.contentJson,
        updatedAt: new Date(),
      })
      .where(eq(articlesTable.id, id))
      .returning();

    if (!article) {
      throw new ArticleActionError("This article no longer exists.");
    }

    return article;
  } catch (error) {
    if (error instanceof ArticleActionError) {
      throw error;
    }

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

    throw new ArticleActionError(
      "Unable to update the article in the database. Please try again.",
    );
  }
}

export async function updateArticleAction(
  id: string,
  _previousState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  let article: Article;

  try {
    article = await updateArticle(id, getArticleInputFromFormData(formData));
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
        fieldErrors: getArticleFieldErrors(error),
      };
    }

    return {
      status: "error",
      message: "Unable to update the article right now. Please try again.",
      fieldErrors: {},
    };
  }

  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath(`/articles/${article.slug}`);
  revalidatePath(`/admin/articles/${article.id}/edit`);
  redirect(`/admin/articles/${article.id}/edit?saved=1`);
}
