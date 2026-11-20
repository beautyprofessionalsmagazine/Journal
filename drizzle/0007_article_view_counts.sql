CREATE TYPE "public"."article_view_mode" AS ENUM('actual', 'manual');--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "views" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "manual_views" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "view_count_mode" "article_view_mode" DEFAULT 'actual' NOT NULL;--> statement-breakpoint
-- The previous counter was never instrumented. Preserve its displayed value
-- as a manual count; measured views begin when tracking is deployed.
UPDATE "articles" SET "manual_views" = GREATEST("views", 0), "view_count_mode" = CASE WHEN "views" > 0 THEN 'manual'::"article_view_mode" ELSE 'actual'::"article_view_mode" END, "views" = 0;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_views_range" CHECK ("articles"."views" between 0 and 9007199254740991);--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_manual_views_range" CHECK ("articles"."manual_views" between 0 and 9007199254740991);
