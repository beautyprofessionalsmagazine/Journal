"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { hasAdminSession } from "@/features/admin/server/admin-auth";
import { siteSettingsTable } from "@/features/site-settings/db/site-settings-schema";
import { getSiteSettings } from "@/features/site-settings/server/site-settings-queries";
import type { SiteSettingsFormState } from "@/features/site-settings/types/site-settings";
import {
  getSiteSettingsFieldErrors,
  getSiteSettingsFromFormData,
  validateSiteSettings,
} from "@/features/site-settings/validation/site-settings-validation";
import { db } from "@/shared/lib/db";

export async function updateSiteSettingsAction(
  _previousState: SiteSettingsFormState,
  formData: FormData,
): Promise<SiteSettingsFormState> {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  const parsed = validateSiteSettings(getSiteSettingsFromFormData(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors: getSiteSettingsFieldErrors(parsed.error),
    };
  }

  const values = parsed.data;

  try {
    const existing = await getSiteSettings();

    if (existing) {
      await db
        .update(siteSettingsTable)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(siteSettingsTable.id, existing.id));
    } else {
      await db.insert(siteSettingsTable).values(values);
    }
  } catch {
    return {
      status: "error",
      message: "Unable to save the office address right now. Please try again.",
      fieldErrors: {},
    };
  }

  revalidatePath("/admin/subscriptions");
  revalidatePath("/where-to-find");

  return {
    status: "success",
    message: "Office address saved. The distribution map is up to date.",
    fieldErrors: {},
  };
}
