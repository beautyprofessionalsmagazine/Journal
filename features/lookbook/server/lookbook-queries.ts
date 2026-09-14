import { eq } from "drizzle-orm";

import { lookbookTable } from "@/features/lookbook/db/lookbook-schema";
import type { Lookbook } from "@/features/lookbook/types/lookbook";
import { db } from "@/shared/lib/db";

const ACTIVE_LOOKBOOK_ID = "active";

export async function getActiveLookbook(): Promise<Lookbook | null> {
  const [lookbook] = await db
    .select()
    .from(lookbookTable)
    .where(eq(lookbookTable.id, ACTIVE_LOOKBOOK_ID))
    .limit(1);

  return lookbook ?? null;
}

export { ACTIVE_LOOKBOOK_ID };
