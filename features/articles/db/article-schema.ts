import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { articleStatusValues } from "@/features/articles/types/article";
import {
  articleViewModeValues,
  MAX_ARTICLE_VIEWS,
} from "@/features/articles/lib/article-views";
import type { CoverImageData } from "@/features/articles/lib/cover-image-settings";

export const articleStatusEnum = pgEnum("article_status", articleStatusValues);
export const articleViewModeEnum = pgEnum(
  "article_view_mode",
  articleViewModeValues,
);

export const articlesTable = pgTable(
  "articles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    category: text("category").notNull(),
    author: text("author").notNull(),
    description: text("description"),
    // The source URL, alt text, per-placement crops, and generated derivatives
    // travel together so the database has one canonical cover record.
    coverImage: jsonb("cover_image").$type<CoverImageData>(),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    status: articleStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", {
      withTimezone: true,
      mode: "date",
    }),
    views: bigint("views", { mode: "number" }).notNull().default(0),
    manualViews: bigint("manual_views", { mode: "number" }).notNull().default(0),
    viewCountMode: articleViewModeEnum("view_count_mode")
      .notNull()
      .default("actual"),
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
    viewsRange: check(
      "articles_views_range",
      sql`${table.views} between 0 and ${sql.raw(String(MAX_ARTICLE_VIEWS))}`,
    ),
    manualViewsRange: check(
      "articles_manual_views_range",
      sql`${table.manualViews} between 0 and ${sql.raw(String(MAX_ARTICLE_VIEWS))}`,
    ),
    slugUniqueIdx: uniqueIndex("articles_slug_unique_idx").on(table.slug),
    categoryIdx: index("articles_category_idx").on(table.category),
    statusIdx: index("articles_status_idx").on(table.status),
    publishedAtIdx: index("articles_published_at_idx").on(table.publishedAt),
  }),
);
