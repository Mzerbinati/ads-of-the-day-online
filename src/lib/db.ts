import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { buildCampaignDetails, DETAILS_VERSION, needsDetails } from "./campaign-detail";
import { getTodayDateString, seededIndex } from "./daily";
import { isEmbeddableVideoUrl, resolveCampaignVideoUrl } from "./video";
import type {
  Campaign,
  CampaignInput,
  CampaignListItem,
  CampaignWithMeta,
  CatalogStats,
  ImportResult,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "lavagna.db");
const CACHE_PATH = path.join(DATA_DIR, "campaigns_cache.json");

let db: Database.Database | null = null;
let ready = false;

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function migrate(database: Database.Database): void {
  const campaignCols = database
    .prepare("PRAGMA table_info(campaigns)")
    .all() as Array<{ name: string }>;
  const names = new Set(campaignCols.map((c) => c.name));

  const additions = ["team", "idea", "insight", "board", "youtube_url"] as const;
  for (const col of additions) {
    if (!names.has(col)) {
      database.exec(`ALTER TABLE campaigns ADD COLUMN ${col} TEXT`);
    }
  }

  database.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS campaign_folders (
      campaign_id TEXT NOT NULL REFERENCES campaigns(id),
      folder_id INTEGER NOT NULL REFERENCES folders(id),
      PRIMARY KEY (campaign_id, folder_id)
    );
  `);
}

function initSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      brand TEXT NOT NULL,
      agency TEXT NOT NULL,
      year TEXT NOT NULL,
      tier TEXT NOT NULL,
      category TEXT NOT NULL,
      url TEXT NOT NULL,
      raw TEXT NOT NULL,
      added_at TEXT NOT NULL DEFAULT (datetime('now')),
      analysis TEXT,
      transcript TEXT
    );

    CREATE TABLE IF NOT EXISTS daily_picks (
      date TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL REFERENCES campaigns(id)
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id TEXT NOT NULL REFERENCES campaigns(id),
      body TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS campaign_areas (
      campaign_id TEXT NOT NULL REFERENCES campaigns(id),
      area_id INTEGER NOT NULL REFERENCES areas(id),
      PRIMARY KEY (campaign_id, area_id)
    );

    CREATE TABLE IF NOT EXISTS meta (
      campaign_id TEXT PRIMARY KEY REFERENCES campaigns(id),
      favorite INTEGER NOT NULL DEFAULT 0,
      rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
      status TEXT NOT NULL DEFAULT 'inbox' CHECK (status IN ('inbox', 'studied', 'reference'))
    );

    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const metaCols = database
    .prepare("PRAGMA table_info(meta)")
    .all() as Array<{ name: string }>;
  const metaNames = new Set(metaCols.map((c) => c.name));
  if (!metaNames.has("personal_note")) {
    database.exec("ALTER TABLE meta ADD COLUMN personal_note TEXT");
  }

  migrate(database);
}

export function getDb(): Database.Database {
  if (!db) {
    ensureDataDir();
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
  }
  return db;
}

function setAppState(key: string, value: string): void {
  getDb()
    .prepare(
      "INSERT INTO app_state (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    )
    .run(key, value);
}

export function importCampaigns(
  campaigns: CampaignInput[],
  source: ImportResult["source"]
): ImportResult {
  const database = getDb();
  let inserted = 0;
  let updated = 0;

  const upsert = database.prepare(`
    INSERT INTO campaigns (id, title, brand, agency, year, tier, category, url, raw, added_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      brand = excluded.brand,
      agency = excluded.agency,
      year = excluded.year,
      tier = excluded.tier,
      category = excluded.category,
      url = excluded.url,
      raw = excluded.raw
  `);

  const ensureMeta = database.prepare(
    "INSERT OR IGNORE INTO meta (campaign_id, favorite, status) VALUES (?, 0, 'inbox')"
  );

  const existsStmt = database.prepare("SELECT 1 FROM campaigns WHERE id = ?");

  const importAll = database.transaction((items: CampaignInput[]) => {
    for (const campaign of items) {
      const exists = existsStmt.get(campaign.id);
      upsert.run(
        campaign.id,
        campaign.title,
        campaign.brand,
        campaign.agency,
        campaign.year,
        campaign.tier,
        campaign.category,
        campaign.url,
        campaign.raw
      );
      ensureMeta.run(campaign.id);
      if (exists) updated++;
      else inserted++;
    }
  });

  importAll(campaigns);
  setAppState("last_import_source", source);
  setAppState("last_import_at", new Date().toISOString());

  return { inserted, updated, total: campaigns.length, source };
}

export function importFromCacheFile(): ImportResult | null {
  if (!fs.existsSync(CACHE_PATH)) return null;

  const raw = fs.readFileSync(CACHE_PATH, "utf-8");
  const parsed = JSON.parse(raw) as CampaignInput[];

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("campaigns_cache.json vuoto o non valido");
  }

  return importCampaigns(parsed, "cache");
}

export function getCampaignCount(): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) as count FROM campaigns")
    .get() as { count: number };
  return row.count;
}

export function getCatalogStats(): CatalogStats {
  return {
    count: getCampaignCount(),
    cacheFileExists: fs.existsSync(CACHE_PATH),
    dbReady: ready,
  };
}

export function getCampaignById(id: string): Campaign | null {
  const row = getDb()
    .prepare("SELECT * FROM campaigns WHERE id = ?")
    .get(id) as Campaign | undefined;
  return row ?? null;
}

export function ensureCampaignDetails(campaignId: string): Campaign {
  const campaign = getCampaignById(campaignId);
  if (!campaign) throw new Error("Campagna non trovata");

  if (!needsDetails(campaign)) return campaign;

  const details = buildCampaignDetails(campaign);
  getDb()
    .prepare(
      "UPDATE campaigns SET team = ?, idea = ?, insight = ?, board = ? WHERE id = ?"
    )
    .run(
      details.team,
      details.idea,
      details.insight,
      details.board,
      campaignId
    );

  return { ...campaign, ...details };
}

function migrateCampaignDetailsVersion(): void {
  const database = getDb();
  const row = database
    .prepare("SELECT value FROM app_state WHERE key = 'details_version'")
    .get() as { value: string } | undefined;

  if (row?.value === DETAILS_VERSION) return;

  database.exec(`
    UPDATE campaigns
    SET team = NULL, idea = NULL, insight = NULL, board = NULL
  `);

  database
    .prepare(
      "INSERT INTO app_state (key, value) VALUES ('details_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    )
    .run(DETAILS_VERSION);
}

function hasEmbeddableVideo(campaign: Pick<Campaign, "url">): boolean {
  return isEmbeddableVideoUrl(campaign.url);
}

function clearInvalidYoutubeGuesses(): void {
  getDb().exec(`
    UPDATE campaigns
    SET youtube_url = NULL
    WHERE youtube_url IS NOT NULL
      AND url NOT LIKE '%youtube%'
      AND url NOT LIKE '%youtu.be%'
      AND url NOT LIKE '%vimeo%'
  `);
}

function getAlreadyPickedCampaignIds(excludeDate?: string): Set<string> {
  const database = getDb();
  const rows = excludeDate
    ? (database
        .prepare(
          "SELECT campaign_id FROM daily_picks WHERE date != ?"
        )
        .all(excludeDate) as Array<{ campaign_id: string }>)
    : (database
        .prepare("SELECT campaign_id FROM daily_picks")
        .all() as Array<{ campaign_id: string }>);

  return new Set(rows.map((row) => row.campaign_id));
}

function isCampaignAlreadyPicked(
  campaignId: string,
  excludeDate?: string
): boolean {
  return getAlreadyPickedCampaignIds(excludeDate).has(campaignId);
}

function todayPickNeedsReplacement(row: {
  campaign_id: string;
  url: string;
}): boolean {
  const date = getTodayDateString();

  return (
    isCampaignAlreadyPicked(row.campaign_id, date) ||
    row.campaign_id === "2003-the-farmer"
  );
}

function ensureTodayPickValid(): void {
  const date = getTodayDateString();
  const database = getDb();
  const row = database
    .prepare(
      `
      SELECT dp.campaign_id, c.url
      FROM daily_picks dp
      JOIN campaigns c ON c.id = dp.campaign_id
      WHERE dp.date = ?
    `
    )
    .get(date) as { campaign_id: string; url: string } | undefined;

  if (!row || !todayPickNeedsReplacement(row)) return;

  replaceTodayPick();
}

export function getCampaignVideoUrl(campaign: Campaign): string {
  return resolveCampaignVideoUrl(campaign);
}

export function ensureVideoUrl(campaign: Campaign): string {
  return resolveCampaignVideoUrl(campaign);
}

export function getCampaignWithMeta(id: string): CampaignWithMeta | null {
  const campaign = ensureCampaignDetails(id);
  const meta = getDb()
    .prepare(
      "SELECT rating, favorite, personal_note FROM meta WHERE campaign_id = ?"
    )
    .get(id) as
    | { rating: number | null; favorite: number; personal_note: string | null }
    | undefined;

  return {
    ...campaign,
    rating: meta?.rating ?? null,
    favorite: Boolean(meta?.favorite),
    personal_note: meta?.personal_note ?? null,
  };
}

function pickCampaignForDate(
  date: string,
  options?: { excludeDate?: string; extraExcludeIds?: string[] }
): Campaign | null {
  const database = getDb();
  const usedIds = getAlreadyPickedCampaignIds(options?.excludeDate);

  for (const id of options?.extraExcludeIds ?? []) {
    usedIds.add(id);
  }

  const all = database
    .prepare("SELECT * FROM campaigns ORDER BY id")
    .all() as Campaign[];

  let pool = all.filter((campaign) => !usedIds.has(campaign.id));

  if (pool.length === 0) {
    pool = all.filter(
      (campaign) => !options?.extraExcludeIds?.includes(campaign.id)
    );
  }

  if (pool.length === 0) return null;

  const videoPool = pool.filter(hasEmbeddableVideo);
  const finalPool = videoPool.length > 0 ? videoPool : pool;

  const index = seededIndex(date, finalPool.length);
  return finalPool[index];
}

export function replaceTodayPick(): Campaign | null {
  const date = getTodayDateString();
  const database = getDb();

  const current = database
    .prepare("SELECT campaign_id FROM daily_picks WHERE date = ?")
    .get(date) as { campaign_id: string } | undefined;

  database.prepare("DELETE FROM daily_picks WHERE date = ?").run(date);

  const picked = pickCampaignForDate(`${date}-replace-${Date.now()}`, {
    extraExcludeIds: current ? [current.campaign_id] : [],
  });
  if (!picked) return null;

  database
    .prepare("INSERT INTO daily_picks (date, campaign_id) VALUES (?, ?)")
    .run(date, picked.id);

  return ensureCampaignDetails(picked.id);
}

export function getOrCreateTodayPick(): {
  date: string;
  campaign: Campaign | null;
} {
  const date = getTodayDateString();
  const database = getDb();

  const existing = database
    .prepare(
      `
      SELECT c.* FROM daily_picks dp
      JOIN campaigns c ON c.id = dp.campaign_id
      WHERE dp.date = ?
    `
    )
    .get(date) as Campaign | undefined;

  if (existing) {
    if (
      todayPickNeedsReplacement({
        campaign_id: existing.id,
        url: existing.url,
      })
    ) {
      const fixed = replaceTodayPick();
      return { date, campaign: fixed };
    }

    return { date, campaign: ensureCampaignDetails(existing.id) };
  }

  const picked = pickCampaignForDate(date);
  if (!picked) return { date, campaign: null };

  database
    .prepare("INSERT INTO daily_picks (date, campaign_id) VALUES (?, ?)")
    .run(date, picked.id);

  return { date, campaign: ensureCampaignDetails(picked.id) };
}

function mapListItem(
  row: Campaign & {
    rating: number | null;
    favorite: number;
    pick_date?: string;
  }
): CampaignListItem {
  return {
    ...row,
    favorite: Boolean(row.favorite),
  };
}

export function getRecentDailyPicks(
  limit = 14
): CampaignListItem[] {
  const today = getTodayDateString();
  const rows = getDb()
    .prepare(
      `
      SELECT c.*, m.rating, m.favorite, dp.date as pick_date
      FROM daily_picks dp
      JOIN campaigns c ON c.id = dp.campaign_id
      LEFT JOIN meta m ON m.campaign_id = c.id
      WHERE dp.date < ?
      ORDER BY dp.date DESC
      LIMIT ?
    `
    )
    .all(today, limit) as Array<
    Campaign & { rating: number | null; favorite: number; pick_date: string }
  >;

  return rows.map(mapListItem);
}

export function getFavoriteCampaigns(): CampaignListItem[] {
  const rows = getDb()
    .prepare(
      `
      SELECT c.*, m.rating, m.favorite
      FROM campaigns c
      JOIN meta m ON m.campaign_id = c.id
      WHERE m.favorite = 1
      ORDER BY m.rating DESC NULLS LAST, c.title ASC
    `
    )
    .all() as Array<Campaign & { rating: number | null; favorite: number }>;

  return rows.map(mapListItem);
}

export function skipTodayPick(): Campaign | null {
  return replaceTodayPick();
}

export function setCampaignRating(
  campaignId: string,
  rating: number | null
): void {
  getDb()
    .prepare(
      `INSERT INTO meta (campaign_id, favorite, rating, status)
       VALUES (?, 0, ?, 'inbox')
       ON CONFLICT(campaign_id) DO UPDATE SET rating = excluded.rating`
    )
    .run(campaignId, rating);
}

export function setCampaignFavorite(
  campaignId: string,
  favorite: boolean
): void {
  getDb()
    .prepare(
      `INSERT INTO meta (campaign_id, favorite, status)
       VALUES (?, ?, 'inbox')
       ON CONFLICT(campaign_id) DO UPDATE SET favorite = excluded.favorite`
    )
    .run(campaignId, favorite ? 1 : 0);
}

export function setPersonalNote(
  campaignId: string,
  note: string | null
): void {
  const trimmed = note?.trim() || null;
  getDb()
    .prepare(
      `INSERT INTO meta (campaign_id, favorite, personal_note, status)
       VALUES (?, 0, ?, 'inbox')
       ON CONFLICT(campaign_id) DO UPDATE SET personal_note = excluded.personal_note`
    )
    .run(campaignId, trimmed);
}

export function ensureDatabaseReady(): void {
  if (ready) return;

  getDb();
  clearInvalidYoutubeGuesses();
  migrateCampaignDetailsVersion();
  ensureTodayPickValid();

  const count = getCampaignCount();
  if (count === 0 && fs.existsSync(CACHE_PATH)) {
    importFromCacheFile();
  }

  ready = true;
}
