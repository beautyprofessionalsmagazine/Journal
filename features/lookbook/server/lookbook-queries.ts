import { and, desc, eq, sql } from "drizzle-orm";

import { lookbookTable } from "@/features/lookbook/db/lookbook-schema";
import { sortLookbooksNewestFirst } from "@/features/lookbook/lib/lookbook-issue";
import type { Lookbook } from "@/features/lookbook/types/lookbook";
import { db } from "@/shared/lib/db";

/** Postgres SQLSTATE for a column that does not exist. */
const UNDEFINED_COLUMN = "42703";

export type LookbookSchemaState = "current" | "legacy";

export type LookbookArchive =
  | { status: "ready"; lookbooks: Lookbook[]; schema: LookbookSchemaState }
  | { status: "unavailable"; lookbooks: []; schema: null };

type LookbookRow = typeof lookbookTable.$inferSelect;

/**
 * Loads every published edition without ever throwing.
 *
 * A database that has not run migration 0006 yet still has the singleton
 * `lookbook` table (no `issue_year` / `issue_month`). Instead of crashing the
 * route, that edition is dated from `updated_at` — exactly what the migration
 * itself does — and the archive reports `schema: "legacy"` so the admin can
 * warn that publishing needs the migration.
 */
export async function getLookbookArchive(): Promise<LookbookArchive> {
  try {
    const rows = await db
      .select()
      .from(lookbookTable)
      .orderBy(desc(lookbookTable.issueYear), desc(lookbookTable.issueMonth));

    return { status: "ready", lookbooks: rows.map(toLookbook), schema: "current" };
  } catch (error) {
    if (isUndefinedColumnError(error)) {
      try {
        const lookbooks = await getLegacyLookbooks();
        console.warn(
          "[lookbook] The lookbook table is missing issue_year/issue_month. " +
            "Run `npm run db:migrate` (migration 0006). Serving legacy rows dated from updated_at.",
        );
        return { status: "ready", lookbooks, schema: "legacy" };
      } catch (legacyError) {
        console.error("[lookbook] Failed to read legacy Lookbook rows.", legacyError);
        return unavailableArchive;
      }
    }

    console.error("[lookbook] Failed to load the Lookbook archive.", error);
    return unavailableArchive;
  }
}

export async function getLookbooks(): Promise<Lookbook[]> {
  return (await getLookbookArchive()).lookbooks;
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

  return lookbook ? toLookbook(lookbook) : null;
}

export function isUndefinedColumnError(error: unknown): boolean {
  let current: unknown = error;

  // Drizzle wraps driver errors in DrizzleQueryError; the SQLSTATE lives on `cause`.
  for (let depth = 0; current && depth < 4; depth += 1) {
    if (
      typeof current === "object" &&
      "code" in current &&
      (current as { code?: unknown }).code === UNDEFINED_COLUMN
    ) {
      return true;
    }
    current = (current as { cause?: unknown }).cause;
  }

  return false;
}

async function getLegacyLookbooks(): Promise<Lookbook[]> {
  const rows = await db.execute<{
    id: string;
    file_url: string;
    file_name: string;
    file_size: number | string;
    updated_at: Date | string;
  }>(sql`select id, file_url, file_name, file_size, updated_at from lookbook`);

  return [...rows]
    .map((row) => {
      const updatedAt = new Date(row.updated_at);

      return {
        id: row.id,
        issueYear: updatedAt.getUTCFullYear(),
        issueMonth: updatedAt.getUTCMonth() + 1,
        fileUrl: row.file_url,
        fileName: row.file_name,
        fileSize: Number(row.file_size),
        updatedAt,
      };
    })
    .sort(sortLookbooksNewestFirst);
}

function toLookbook(row: LookbookRow): Lookbook {
  // Some databases store file_size as bigint, which the driver returns as a string.
  return { ...row, fileSize: Number(row.fileSize) };
}

const unavailableArchive: LookbookArchive = {
  status: "unavailable",
  lookbooks: [],
  schema: null,
};
