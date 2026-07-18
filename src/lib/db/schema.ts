import { sql } from "drizzle-orm";
import {
  check,
  integer,
  primaryKey,
  pgTable,
  text,
  uuid,
  timestamp,
} from "drizzle-orm/pg-core";

export const campaigns = pgTable("campaigns", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  brand: text("brand").notNull(),
  agency: text("agency").notNull(),
  year: text("year").notNull(),
  tier: text("tier").notNull(),
  category: text("category").notNull(),
  url: text("url").notNull(),
  raw: text("raw").notNull(),
  addedAt: text("added_at")
    .notNull()
    .default(sql`(now() AT TIME ZONE 'utc')`),
  analysis: text("analysis"),
  transcript: text("transcript"),
  team: text("team"),
  idea: text("idea"),
  insight: text("insight"),
  board: text("board"),
  youtubeUrl: text("youtube_url"),
});

export const dailyPicks = pgTable("daily_picks", {
  date: text("date").primaryKey(),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaigns.id),
});

export const notes = pgTable("notes", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaigns.id),
  body: text("body").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(now() AT TIME ZONE 'utc')`),
});

export const areas = pgTable("areas", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: text("name").notNull().unique(),
  description: text("description").notNull().default(""),
  color: text("color").notNull(),
});

export const campaignAreas = pgTable(
  "campaign_areas",
  {
    campaignId: text("campaign_id")
      .notNull()
      .references(() => campaigns.id),
    areaId: integer("area_id")
      .notNull()
      .references(() => areas.id),
  },
  (table) => [primaryKey({ columns: [table.campaignId, table.areaId] })]
);

/** Linked to auth.users.id (FK enforced in SQL migration). */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  displayName: text("display_name"),
  username: text("username").unique(),
  creativeRole: text("creative_role"),
  creativeRoleOther: text("creative_role_other"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export const meta = pgTable(
  "meta",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => campaigns.id),
    favorite: integer("favorite").notNull().default(0),
    rating: integer("rating"),
    status: text("status").notNull().default("inbox"),
    personalNote: text("personal_note"),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.campaignId] }),
    check(
      "meta_rating_check",
      sql`${table.rating} IS NULL OR (${table.rating} >= 1 AND ${table.rating} <= 5)`
    ),
    check(
      "meta_status_check",
      sql`${table.status} IN ('inbox', 'studied', 'reference')`
    ),
  ]
);

export const folders = pgTable("folders", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: text("name").notNull().unique(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(now() AT TIME ZONE 'utc')`),
});

export const campaignFolders = pgTable(
  "campaign_folders",
  {
    campaignId: text("campaign_id")
      .notNull()
      .references(() => campaigns.id),
    folderId: integer("folder_id")
      .notNull()
      .references(() => folders.id),
  },
  (table) => [primaryKey({ columns: [table.campaignId, table.folderId] })]
);

export const appState = pgTable("app_state", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
