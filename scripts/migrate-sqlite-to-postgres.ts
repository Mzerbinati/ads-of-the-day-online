/**
 * One-shot import: data/lavagna.db (SQLite) → Postgres (DATABASE_URL).
 *
 * Usage:
 *   1. Copy lavagna.db into data/ (from the original local project if needed)
 *   2. Set DATABASE_URL in .env.local
 *   3. Run: npm run db:migrate   (create empty tables)
 *   4. Run: npm run db:migrate-from-sqlite
 */
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import {
  appState,
  areas,
  campaignAreas,
  campaignFolders,
  campaigns,
  dailyPicks,
  folders,
  meta,
  notes,
} from "../src/lib/db/schema";

config({ path: ".env.local" });
config(); // fallback .env

const SQLITE_PATH = path.join(process.cwd(), "data", "lavagna.db");

function tableExists(sqlite: Database.Database, name: string): boolean {
  const row = sqlite
    .prepare(
      "SELECT 1 as ok FROM sqlite_master WHERE type = 'table' AND name = ?"
    )
    .get(name) as { ok: number } | undefined;
  return Boolean(row);
}

async function resetIdentity(
  db: ReturnType<typeof drizzle>,
  table: string
): Promise<void> {
  await db.execute(sql.raw(`
    SELECT setval(
      pg_get_serial_sequence('${table}', 'id'),
      COALESCE((SELECT MAX(id) FROM ${table}), 1),
      true
    )
  `));
}

async function main(): Promise<void> {
  if (!fs.existsSync(SQLITE_PATH)) {
    throw new Error(
      `File non trovato: ${SQLITE_PATH}\nCopia lavagna.db dal progetto locale in data/ e riprova.`
    );
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL mancante. Impostala in .env.local.");
  }

  const sqlite = new Database(SQLITE_PATH, { readonly: true });
  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(client);

  console.log("Lettura SQLite e scrittura su Postgres…");

  const campaignRows = sqlite.prepare("SELECT * FROM campaigns").all() as Array<
    Record<string, unknown>
  >;
  console.log(`  campaigns: ${campaignRows.length}`);
  if (campaignRows.length > 0) {
    const mapped = campaignRows.map((r) => ({
      id: String(r.id),
      title: String(r.title),
      brand: String(r.brand),
      agency: String(r.agency),
      year: String(r.year),
      tier: String(r.tier),
      category: String(r.category),
      url: String(r.url),
      raw: String(r.raw),
      addedAt: r.added_at != null ? String(r.added_at) : undefined,
      analysis: r.analysis != null ? String(r.analysis) : null,
      transcript: r.transcript != null ? String(r.transcript) : null,
      team: r.team != null ? String(r.team) : null,
      idea: r.idea != null ? String(r.idea) : null,
      insight: r.insight != null ? String(r.insight) : null,
      board: r.board != null ? String(r.board) : null,
      youtubeUrl: r.youtube_url != null ? String(r.youtube_url) : null,
    }));
    const chunk = 100;
    for (let i = 0; i < mapped.length; i += chunk) {
      await db
        .insert(campaigns)
        .values(mapped.slice(i, i + chunk))
        .onConflictDoNothing();
    }
  }

  if (tableExists(sqlite, "meta")) {
    const rows = sqlite.prepare("SELECT * FROM meta").all() as Array<
      Record<string, unknown>
    >;
    console.log(`  meta: ${rows.length}`);
    if (rows.length > 0) {
      const chunk = 200;
      const mapped = rows.map((r) => ({
        campaignId: String(r.campaign_id),
        favorite: Number(r.favorite ?? 0),
        rating: r.rating == null ? null : Number(r.rating),
        status: String(r.status ?? "inbox"),
        personalNote: r.personal_note != null ? String(r.personal_note) : null,
      }));
      for (let i = 0; i < mapped.length; i += chunk) {
        await db
          .insert(meta)
          .values(mapped.slice(i, i + chunk))
          .onConflictDoNothing();
      }
    }
  }

  if (tableExists(sqlite, "daily_picks")) {
    const rows = sqlite.prepare("SELECT * FROM daily_picks").all() as Array<
      Record<string, unknown>
    >;
    console.log(`  daily_picks: ${rows.length}`);
    if (rows.length > 0) {
      await db
        .insert(dailyPicks)
        .values(
          rows.map((r) => ({
            date: String(r.date),
            campaignId: String(r.campaign_id),
          }))
        )
        .onConflictDoNothing();
    }
  }

  if (tableExists(sqlite, "notes")) {
    const rows = sqlite.prepare("SELECT * FROM notes").all() as Array<
      Record<string, unknown>
    >;
    console.log(`  notes: ${rows.length}`);
    if (rows.length > 0) {
      await db.insert(notes).values(
        rows.map((r) => ({
          id: Number(r.id),
          campaignId: String(r.campaign_id),
          body: String(r.body),
          createdAt: r.created_at != null ? String(r.created_at) : undefined,
        }))
      );
      await resetIdentity(db, "notes");
    }
  }

  if (tableExists(sqlite, "areas")) {
    const rows = sqlite.prepare("SELECT * FROM areas").all() as Array<
      Record<string, unknown>
    >;
    console.log(`  areas: ${rows.length}`);
    if (rows.length > 0) {
      await db
        .insert(areas)
        .values(
          rows.map((r) => ({
            id: Number(r.id),
            name: String(r.name),
            description: String(r.description ?? ""),
            color: String(r.color),
          }))
        )
        .onConflictDoNothing();
      await resetIdentity(db, "areas");
    }
  }

  if (tableExists(sqlite, "campaign_areas")) {
    const rows = sqlite.prepare("SELECT * FROM campaign_areas").all() as Array<
      Record<string, unknown>
    >;
    console.log(`  campaign_areas: ${rows.length}`);
    if (rows.length > 0) {
      await db
        .insert(campaignAreas)
        .values(
          rows.map((r) => ({
            campaignId: String(r.campaign_id),
            areaId: Number(r.area_id),
          }))
        )
        .onConflictDoNothing();
    }
  }

  if (tableExists(sqlite, "folders")) {
    const rows = sqlite.prepare("SELECT * FROM folders").all() as Array<
      Record<string, unknown>
    >;
    console.log(`  folders: ${rows.length}`);
    if (rows.length > 0) {
      await db
        .insert(folders)
        .values(
          rows.map((r) => ({
            id: Number(r.id),
            name: String(r.name),
            createdAt: r.created_at != null ? String(r.created_at) : undefined,
          }))
        )
        .onConflictDoNothing();
      await resetIdentity(db, "folders");
    }
  }

  if (tableExists(sqlite, "campaign_folders")) {
    const rows = sqlite
      .prepare("SELECT * FROM campaign_folders")
      .all() as Array<Record<string, unknown>>;
    console.log(`  campaign_folders: ${rows.length}`);
    if (rows.length > 0) {
      await db
        .insert(campaignFolders)
        .values(
          rows.map((r) => ({
            campaignId: String(r.campaign_id),
            folderId: Number(r.folder_id),
          }))
        )
        .onConflictDoNothing();
    }
  }

  if (tableExists(sqlite, "app_state")) {
    const rows = sqlite.prepare("SELECT * FROM app_state").all() as Array<
      Record<string, unknown>
    >;
    console.log(`  app_state: ${rows.length}`);
    if (rows.length > 0) {
      await db
        .insert(appState)
        .values(
          rows.map((r) => ({
            key: String(r.key),
            value: String(r.value),
          }))
        )
        .onConflictDoNothing();
    }
  }

  sqlite.close();
  await client.end({ timeout: 5 });
  console.log("Migrazione completata.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
