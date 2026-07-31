import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { articleStatusValues } from "@/features/articles/types/article";

export const articleStatusEnum = pgEnum("article_status", articleStatusValues);

export const articlesTable = pgTable(
  "articles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    category: text("category").notNull(),
    author: text("author").notNull(),
    description: text("description"),
    coverImage: text("cover_image"),
    coverImageAlt: text("cover_image_alt"),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    status: articleStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", {
      withTimezone: true,
      mode: "date",
    }),
    views: integer("views").notNull().default(0),
    contentJson: jsonb("content_json"),
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
  },
  (table) => ({
    slugUniqueIdx: uniqueIndex("articles_slug_unique_idx").on(table.slug),
    categoryIdx: index("articles_category_idx").on(table.category),
    statusIdx: index("articles_status_idx").on(table.status),
    publishedAtIdx: index("articles_published_at_idx").on(table.publishedAt),
  }),
);
