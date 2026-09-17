import { and, desc, eq } from "drizzle-orm";

import { lookbookTable } from "@/features/lookbook/db/lookbook-schema";
import type { Lookbook } from "@/features/lookbook/types/lookbook";
import { db } from "@/shared/lib/db";

export async function getLookbooks(): Promise<Lookbook[]> {
  return db
    .select()
    .from(lookbookTable)
    .orderBy(desc(lookbookTable.issueYear), desc(lookbookTable.issueMonth));
}

export async function getLookbookIssue(
  issueYear: number,
  issueMonth: number,
): Promise<Lookbook | null> {
  const [lookbook] = await db
    .select()
    .from(lookbookTable)
    .where(
      and(
        eq(lookbookTable.issueYear, issueYear),
        eq(lookbookTable.issueMonth, issueMonth),
      ),
    )
    .limit(1);

  return lookbook ?? null;
}
