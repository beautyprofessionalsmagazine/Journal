ALTER TABLE "lookbook" ADD COLUMN "issue_year" integer;--> statement-breakpoint
ALTER TABLE "lookbook" ADD COLUMN "issue_month" integer;--> statement-breakpoint
UPDATE "lookbook"
SET
  "issue_year" = EXTRACT(YEAR FROM "updated_at")::integer,
  "issue_month" = EXTRACT(MONTH FROM "updated_at")::integer;--> statement-breakpoint
ALTER TABLE "lookbook" ALTER COLUMN "issue_year" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "lookbook" ALTER COLUMN "issue_month" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "lookbook_issue_unique" ON "lookbook" USING btree ("issue_year","issue_month");--> statement-breakpoint
ALTER TABLE "lookbook" ADD CONSTRAINT "lookbook_issue_year_check" CHECK ("lookbook"."issue_year" between 2000 and 2100);--> statement-breakpoint
ALTER TABLE "lookbook" ADD CONSTRAINT "lookbook_issue_month_check" CHECK ("lookbook"."issue_month" between 1 and 12);
