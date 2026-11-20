"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hasAdminSession } from "@/features/admin/server/admin-auth";
import { revalidateArticleSurfaces } from "@/features/articles/server/article-revalidation";
import { saveArticleViewSettings } from "@/features/articles/server/article-view-queries";
import { articleViewSettingsSchema } from "@/features/articles/validation/article-view-validation";

export type ArticleViewSettingsState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: { viewCountMode?: string; manualViews?: string };
  actualViews?: number;
};

export async function updateArticleViewSettingsAction(
  id: string,
  _previousState: ArticleViewSettingsState,
  formData: FormData,
): Promise<ArticleViewSettingsState> {
  if (!(await hasAdminSession())) {
    return {
      status: "error",
      message:
        "Your session expired. Sign in again, then retry saving your view settings.",
    };
  }
  if (!z.uuid().safeParse(id).success) {
    return { status: "error", message: "This article could not be found." };
  }
  const parsed = articleViewSettingsSchema.safeParse({
    viewCountMode: formData.get("viewCountMode"),
    manualViews: formData.get("manualViews"),
  });
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    return {
      status: "error",
      message: "Check the highlighted view settings.",
      fieldErrors: {
        viewCountMode: errors.viewCountMode?.[0],
        manualViews: errors.manualViews?.[0],
      },
    };
  }
  try {
    const article = await saveArticleViewSettings(id, parsed.data);
    if (!article)
      return { status: "error", message: "This article no longer exists." };
    revalidateArticleSurfaces(article.slug);
    revalidatePath("/admin");
    revalidatePath("/admin/analytics");
    revalidatePath("/admin/articles");
    revalidatePath(`/admin/articles/${id}/edit`);
    return {
      status: "success",
      message: "View settings saved.",
      actualViews: article.views,
    };
  } catch (error) {
    console.error("[article-views] Unable to save settings", error);
    return {
      status: "error",
      message:
        "Unable to save view settings. Your changes are still here; please retry.",
    };
  }
}
