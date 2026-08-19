import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Single-row table holding editorial-office details. The office address is the
 * anchor pin on the "Where to Find" distribution map.
 */
export const siteSettingsTable = pgTable("site_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  officeName: text("office_name").notNull().default("IBPA Office"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
