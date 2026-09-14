import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const lookbookTable = pgTable("lookbook", {
  id: text("id").primaryKey(),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
