import { sql } from "drizzle-orm";
import {
  check,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const lookbookTable = pgTable(
  "lookbook",
  {
    id: text("id").primaryKey(),
    issueYear: integer("issue_year").notNull(),
    issueMonth: integer("issue_month").notNull(),
    fileUrl: text("file_url").notNull(),
    fileName: text("file_name").notNull(),
    fileSize: integer("file_size").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("lookbook_issue_unique").on(
      table.issueYear,
      table.issueMonth,
    ),
    check(
      "lookbook_issue_year_check",
      sql`${table.issueYear} between 2000 and 2100`,
    ),
    check(
      "lookbook_issue_month_check",
      sql`${table.issueMonth} between 1 and 12`,
    ),
  ],
);
