import { asc } from "drizzle-orm";

import { siteSettingsTable } from "@/features/site-settings/db/site-settings-schema";
import type { SiteSettings } from "@/features/site-settings/types/site-settings";
import { db } from "@/shared/lib/db";

/**
 * Site settings are a single row. The first record wins so a stray insert can
 * never silently swap the published office address.
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  const [settings] = await db
    .select()
    .from(siteSettingsTable)
    .orderBy(asc(siteSettingsTable.createdAt))
    .limit(1);

  return settings ?? null;
}
