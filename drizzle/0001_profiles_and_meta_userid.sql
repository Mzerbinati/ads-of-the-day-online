-- Applied manually against Supabase (meta was empty).
-- Recreates meta with composite PK (user_id, campaign_id) and adds profiles.

CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	"display_name" text,
	"username" text,
	"creative_role" text,
	"creative_role_other" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_username_unique" UNIQUE("username")
);

DROP TABLE IF EXISTS "meta";

CREATE TABLE "meta" (
	"user_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
	"campaign_id" text NOT NULL REFERENCES "campaigns"("id"),
	"favorite" integer DEFAULT 0 NOT NULL,
	"rating" integer,
	"status" text DEFAULT 'inbox' NOT NULL,
	"personal_note" text,
	CONSTRAINT "meta_user_id_campaign_id_pk" PRIMARY KEY("user_id","campaign_id"),
	CONSTRAINT "meta_rating_check" CHECK ("rating" IS NULL OR ("rating" >= 1 AND "rating" <= 5)),
	CONSTRAINT "meta_status_check" CHECK ("status" IN ('inbox', 'studied', 'reference'))
);
