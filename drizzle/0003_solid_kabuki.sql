CREATE TABLE "lookbook" (
	"id" text PRIMARY KEY NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
