CREATE TYPE "public"."organization_type" AS ENUM('salon', 'beauty_school', 'brand', 'distributor', 'med_spa', 'clinic');--> statement-breakpoint
CREATE TYPE "public"."subscription_delivery_status" AS ENUM('prepare', 'pending', 'completed');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('pending', 'active', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."subscription_type" AS ENUM('individual', 'salon', 'school');--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"office_name" text DEFAULT 'IBPA Office' NOT NULL,
	"address_line1" text,
	"address_line2" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "subscription_type" NOT NULL,
	"status" "subscription_status" DEFAULT 'pending' NOT NULL,
	"delivery_status" "subscription_delivery_status" DEFAULT 'prepare' NOT NULL,
	"first_name" text,
	"last_name" text,
	"email" text NOT NULL,
	"profession" text,
	"organization_name" text,
	"contact_person" text,
	"organization_type" "organization_type",
	"address_line1" text,
	"address_line2" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"copies" integer,
	"email_consent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "subscriptions_type_idx" ON "subscriptions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subscriptions_delivery_status_idx" ON "subscriptions" USING btree ("delivery_status");--> statement-breakpoint
CREATE INDEX "subscriptions_state_idx" ON "subscriptions" USING btree ("state");--> statement-breakpoint
CREATE INDEX "subscriptions_created_at_idx" ON "subscriptions" USING btree ("created_at");