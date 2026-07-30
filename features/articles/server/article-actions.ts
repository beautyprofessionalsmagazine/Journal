"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";

import { articlesTable } from "@/features/articles/db/article-schema";
import { getArticleBySlug } from "@/features/articles/server/article-queries";
import { hasAdminSession } from "@/features/admin/server/admin-auth";
import type {
  Article,
  CreateArticleFieldErrors,
  CreateArticleFormState,
  CreateArticleInput,
} from "@/features/articles/types/article";
import {
  getCreateArticleFieldErrors,
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
      getCreateArticleFieldErrors(parsedInput.error),
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
  _previousState: CreateArticleFormState,
  formData: FormData,
): Promise<CreateArticleFormState> {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  let article: Article;

  try {
    article = await createArticle(getCreateArticleInputFromFormData(formData));
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
        fieldErrors: getCreateArticleFieldErrors(error),
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
