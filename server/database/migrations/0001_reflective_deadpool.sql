CREATE TABLE "gc_custom_apps" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon_url" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"subdomain" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gc_custom_apps_subdomain_unique" UNIQUE("subdomain")
);
--> statement-breakpoint
CREATE INDEX "gc_custom_apps_enabled_sort_order_idx" ON "gc_custom_apps" USING btree ("enabled","sort_order");