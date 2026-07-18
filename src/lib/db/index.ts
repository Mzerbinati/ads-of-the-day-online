import { and, asc, desc, eq, inArray, isNotNull, ne, or, sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { buildCampaignDetails, DETAILS_VERSION, needsDetails } from "../campaign-detail";
import { getTodayDateString, seededIndex } from "../daily";
import { getDb } from "./client";
import {
  appState,
  campaigns,
  dailyPicks,
  meta,
  profiles,
} from "./schema";
import type { Profile } from "../profile";
import { isEmbeddableVideoUrl, resolveCampaignVideoUrl } from "../video";
import type {
  Campaign,
  CampaignInput,
  CampaignListItem,
  CampaignWithMeta,
  CatalogStats,
  GlobalRating,
  ImportResult,
} from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const CACHE_PATH = path.join(DATA_DIR, "campaigns_cache.json");

let ready = false;

type CampaignRow = typeof campaigns.$inferSelect;

function mapCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    title: row.title,
    brand: row.brand,
    agency: row.agency,
    year: row.year,
    tier: row.tier,
    category: row.category,
    url: row.url,
    raw: row.raw,
    added_at: row.addedAt,
    analysis: row.analysis,
    transcript: row.transcript,
    team: row.team,
    idea: row.idea,
    insight: row.insight,
    board: row.board,
    youtube_url: row.youtubeUrl,
  };
}

async function setAppState(key: string, value: string): Promise<void> {
  const db = getDb();
  await db
    .insert(appState)
    .values({ key, value })
    .onConflictDoUpdate({
      target: appState.key,
      set: { value },
    });
}

export async function importCampaigns(
  items: CampaignInput[],
  source: ImportResult["source"]
): Promise<ImportResult> {
  const db = getDb();
  let inserted = 0;
  let updated = 0;

  await db.transaction(async (tx) => {
    for (const campaign of items) {
      const existing = await tx
        .select({ id: campaigns.id })
        .from(campaigns)
        .where(eq(campaigns.id, campaign.id))
        .limit(1);

      await tx
        .insert(campaigns)
        .values({
          id: campaign.id,
          title: campaign.title,
          brand: campaign.brand,
          agency: campaign.agency,
          year: campaign.year,
          tier: campaign.tier,
          category: campaign.category,
          url: campaign.url,
          raw: campaign.raw,
        })
        .onConflictDoUpdate({
          target: campaigns.id,
          set: {
            title: campaign.title,
            brand: campaign.brand,
            agency: campaign.agency,
            year: campaign.year,
            tier: campaign.tier,
            category: campaign.category,
            url: campaign.url,
            raw: campaign.raw,
          },
        });

      if (existing.length > 0) updated++;
      else inserted++;
    }
  });

  await setAppState("last_import_source", source);
  await setAppState("last_import_at", new Date().toISOString());

  return { inserted, updated, total: items.length, source };
}

export async function importFromCacheFile(): Promise<ImportResult | null> {
  if (!fs.existsSync(CACHE_PATH)) return null;

  const raw = fs.readFileSync(CACHE_PATH, "utf-8");
  const parsed = JSON.parse(raw) as CampaignInput[];

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("campaigns_cache.json vuoto o non valido");
  }

  return importCampaigns(parsed, "cache");
}

export async function getCampaignCount(): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(campaigns);
  return rows[0]?.count ?? 0;
}

export async function getCatalogStats(): Promise<CatalogStats> {
  return {
    count: await getCampaignCount(),
    cacheFileExists: fs.existsSync(CACHE_PATH),
    dbReady: ready,
  };
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, id))
    .limit(1);
  return rows[0] ? mapCampaign(rows[0]) : null;
}

export async function ensureCampaignDetails(
  campaignId: string
): Promise<Campaign> {
  const campaign = await getCampaignById(campaignId);
  if (!campaign) throw new Error("Campagna non trovata");

  if (!needsDetails(campaign)) return campaign;

  const details = buildCampaignDetails(campaign);
  const db = getDb();
  await db
    .update(campaigns)
    .set({
      team: details.team,
      idea: details.idea,
      insight: details.insight,
      board: details.board,
    })
    .where(eq(campaigns.id, campaignId));

  return { ...campaign, ...details };
}

async function migrateCampaignDetailsVersion(): Promise<void> {
  const db = getDb();
  const rows = await db
    .select()
    .from(appState)
    .where(eq(appState.key, "details_version"))
    .limit(1);

  if (rows[0]?.value === DETAILS_VERSION) return;

  await db
    .update(campaigns)
    .set({ team: null, idea: null, insight: null, board: null });

  await db
    .insert(appState)
    .values({ key: "details_version", value: DETAILS_VERSION })
    .onConflictDoUpdate({
      target: appState.key,
      set: { value: DETAILS_VERSION },
    });
}

function hasEmbeddableVideo(campaign: Pick<Campaign, "url">): boolean {
  return isEmbeddableVideoUrl(campaign.url);
}

async function clearInvalidYoutubeGuesses(): Promise<void> {
  const db = getDb();
  await db.execute(sql`
    UPDATE campaigns
    SET youtube_url = NULL
    WHERE youtube_url IS NOT NULL
      AND url NOT LIKE '%youtube%'
      AND url NOT LIKE '%youtu.be%'
      AND url NOT LIKE '%vimeo%'
  `);
}

async function getAlreadyPickedCampaignIds(
  excludeDate?: string
): Promise<Set<string>> {
  const db = getDb();
  const rows = excludeDate
    ? await db
        .select({ campaignId: dailyPicks.campaignId })
        .from(dailyPicks)
        .where(ne(dailyPicks.date, excludeDate))
    : await db.select({ campaignId: dailyPicks.campaignId }).from(dailyPicks);

  return new Set(rows.map((row) => row.campaignId));
}

async function isCampaignAlreadyPicked(
  campaignId: string,
  excludeDate?: string
): Promise<boolean> {
  const used = await getAlreadyPickedCampaignIds(excludeDate);
  return used.has(campaignId);
}

async function todayPickNeedsReplacement(row: {
  campaign_id: string;
  url: string;
}): Promise<boolean> {
  const date = getTodayDateString();
  return (
    (await isCampaignAlreadyPicked(row.campaign_id, date)) ||
    row.campaign_id === "2003-the-farmer"
  );
}

async function ensureTodayPickValid(): Promise<void> {
  const date = getTodayDateString();
  const db = getDb();
  const rows = await db
    .select({
      campaign_id: dailyPicks.campaignId,
      url: campaigns.url,
    })
    .from(dailyPicks)
    .innerJoin(campaigns, eq(campaigns.id, dailyPicks.campaignId))
    .where(eq(dailyPicks.date, date))
    .limit(1);

  const row = rows[0];
  if (!row || !(await todayPickNeedsReplacement(row))) return;

  await replaceTodayPick();
}

export function getCampaignVideoUrl(campaign: Campaign): string {
  return resolveCampaignVideoUrl(campaign);
}

export function ensureVideoUrl(campaign: Campaign): string {
  return resolveCampaignVideoUrl(campaign);
}

export async function getCampaignGlobalRating(
  campaignId: string
): Promise<GlobalRating> {
  const db = getDb();
  const rows = await db
    .select({
      average: sql<number | null>`avg(${meta.rating})::float`,
      count: sql<number>`count(*)::int`,
    })
    .from(meta)
    .where(and(eq(meta.campaignId, campaignId), isNotNull(meta.rating)));

  const count = rows[0]?.count ?? 0;
  if (count === 0) {
    return { average: null, count: 0 };
  }

  return {
    average: rows[0]?.average ?? null,
    count,
  };
}

export async function getCampaignGlobalRatings(
  campaignIds: string[]
): Promise<Map<string, GlobalRating>> {
  const result = new Map<string, GlobalRating>();
  for (const id of campaignIds) {
    result.set(id, { average: null, count: 0 });
  }
  if (campaignIds.length === 0) return result;

  const db = getDb();
  const rows = await db
    .select({
      campaignId: meta.campaignId,
      average: sql<number | null>`avg(${meta.rating})::float`,
      count: sql<number>`count(*)::int`,
    })
    .from(meta)
    .where(and(inArray(meta.campaignId, campaignIds), isNotNull(meta.rating)))
    .groupBy(meta.campaignId);

  for (const row of rows) {
    result.set(row.campaignId, {
      average: row.count > 0 ? row.average : null,
      count: row.count,
    });
  }

  return result;
}

export async function getCampaignWithMeta(
  id: string,
  userId: string
): Promise<CampaignWithMeta | null> {
  const campaign = await ensureCampaignDetails(id);
  const db = getDb();
  const rows = await db
    .select({
      rating: meta.rating,
      favorite: meta.favorite,
      personalNote: meta.personalNote,
    })
    .from(meta)
    .where(and(eq(meta.campaignId, id), eq(meta.userId, userId)))
    .limit(1);

  const row = rows[0];
  const global_rating = await getCampaignGlobalRating(id);

  return {
    ...campaign,
    rating: row?.rating ?? null,
    favorite: Boolean(row?.favorite),
    personal_note: row?.personalNote ?? null,
    global_rating,
  };
}

async function pickCampaignForDate(
  date: string,
  options?: { excludeDate?: string; extraExcludeIds?: string[] }
): Promise<Campaign | null> {
  const db = getDb();
  const usedIds = await getAlreadyPickedCampaignIds(options?.excludeDate);

  for (const id of options?.extraExcludeIds ?? []) {
    usedIds.add(id);
  }

  const allRows = await db.select().from(campaigns).orderBy(asc(campaigns.id));
  const all = allRows.map(mapCampaign);

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

export async function replaceTodayPick(): Promise<Campaign | null> {
  const date = getTodayDateString();
  const db = getDb();

  const currentRows = await db
    .select({ campaignId: dailyPicks.campaignId })
    .from(dailyPicks)
    .where(eq(dailyPicks.date, date))
    .limit(1);
  const current = currentRows[0];

  await db.delete(dailyPicks).where(eq(dailyPicks.date, date));

  const picked = await pickCampaignForDate(`${date}-replace-${Date.now()}`, {
    extraExcludeIds: current ? [current.campaignId] : [],
  });
  if (!picked) return null;

  await db.insert(dailyPicks).values({ date, campaignId: picked.id });

  return ensureCampaignDetails(picked.id);
}

export async function getOrCreateTodayPick(): Promise<{
  date: string;
  campaign: Campaign | null;
}> {
  const date = getTodayDateString();
  const db = getDb();

  const existingRows = await db
    .select({ campaign: campaigns })
    .from(dailyPicks)
    .innerJoin(campaigns, eq(campaigns.id, dailyPicks.campaignId))
    .where(eq(dailyPicks.date, date))
    .limit(1);

  const existing = existingRows[0]?.campaign
    ? mapCampaign(existingRows[0].campaign)
    : undefined;

  if (existing) {
    if (
      await todayPickNeedsReplacement({
        campaign_id: existing.id,
        url: existing.url,
      })
    ) {
      const fixed = await replaceTodayPick();
      return { date, campaign: fixed };
    }

    return { date, campaign: await ensureCampaignDetails(existing.id) };
  }

  const picked = await pickCampaignForDate(date);
  if (!picked) return { date, campaign: null };

  await db.insert(dailyPicks).values({ date, campaignId: picked.id });

  return { date, campaign: await ensureCampaignDetails(picked.id) };
}

function mapListItem(
  row: Campaign & {
    rating: number | null;
    favorite: number;
    pick_date?: string;
    global_rating?: GlobalRating;
  }
): CampaignListItem {
  return {
    ...row,
    favorite: Boolean(row.favorite),
    global_rating: row.global_rating ?? { average: null, count: 0 },
  };
}

export async function getRecentDailyPicks(
  limit = 14,
  userId?: string
): Promise<CampaignListItem[]> {
  const today = getTodayDateString();
  const db = getDb();
  const rows = await db
    .select({
      campaign: campaigns,
      rating: meta.rating,
      favorite: meta.favorite,
      pick_date: dailyPicks.date,
    })
    .from(dailyPicks)
    .innerJoin(campaigns, eq(campaigns.id, dailyPicks.campaignId))
    .leftJoin(
      meta,
      userId
        ? and(eq(meta.campaignId, campaigns.id), eq(meta.userId, userId))
        : sql`false`
    )
    .where(sql`${dailyPicks.date} < ${today}`)
    .orderBy(desc(dailyPicks.date))
    .limit(limit);

  const globals = await getCampaignGlobalRatings(
    rows.map((row) => row.campaign.id)
  );

  return rows.map((row) =>
    mapListItem({
      ...mapCampaign(row.campaign),
      rating: row.rating,
      favorite: row.favorite ?? 0,
      pick_date: row.pick_date,
      global_rating: globals.get(row.campaign.id),
    })
  );
}

export async function getFavoriteCampaigns(
  userId: string
): Promise<CampaignListItem[]> {
  const db = getDb();
  const rows = await db
    .select({
      campaign: campaigns,
      rating: meta.rating,
      favorite: meta.favorite,
    })
    .from(campaigns)
    .innerJoin(meta, eq(meta.campaignId, campaigns.id))
    .where(and(eq(meta.favorite, 1), eq(meta.userId, userId)))
    .orderBy(sql`${meta.rating} DESC NULLS LAST`, asc(campaigns.title));

  const globals = await getCampaignGlobalRatings(
    rows.map((row) => row.campaign.id)
  );

  return rows.map((row) =>
    mapListItem({
      ...mapCampaign(row.campaign),
      rating: row.rating,
      favorite: row.favorite,
      global_rating: globals.get(row.campaign.id),
    })
  );
}

export async function skipTodayPick(): Promise<Campaign | null> {
  return replaceTodayPick();
}

export async function setCampaignRating(
  campaignId: string,
  rating: number | null,
  userId: string
): Promise<void> {
  const db = getDb();
  await db
    .insert(meta)
    .values({
      userId,
      campaignId,
      favorite: 0,
      rating,
      status: "inbox",
    })
    .onConflictDoUpdate({
      target: [meta.userId, meta.campaignId],
      set: { rating },
    });
}

export async function setCampaignFavorite(
  campaignId: string,
  favorite: boolean,
  userId: string
): Promise<void> {
  const db = getDb();
  await db
    .insert(meta)
    .values({
      userId,
      campaignId,
      favorite: favorite ? 1 : 0,
      status: "inbox",
    })
    .onConflictDoUpdate({
      target: [meta.userId, meta.campaignId],
      set: { favorite: favorite ? 1 : 0 },
    });
}

export async function setPersonalNote(
  campaignId: string,
  note: string | null,
  userId: string
): Promise<void> {
  const trimmed = note?.trim() || null;
  const db = getDb();
  await db
    .insert(meta)
    .values({
      userId,
      campaignId,
      favorite: 0,
      personalNote: trimmed,
      status: "inbox",
    })
    .onConflictDoUpdate({
      target: [meta.userId, meta.campaignId],
      set: { personalNote: trimmed },
    });
}

/** Used by chat-context for archive / search queries. */
export async function getArchivePickRows(
  userId: string
): Promise<
  Array<
    Campaign & {
      pick_date: string | null;
      rating: number | null;
      favorite: number;
      personal_note: string | null;
    }
  >
> {
  const db = getDb();
  const rows = await db
    .select({
      campaign: campaigns,
      pick_date: dailyPicks.date,
      rating: meta.rating,
      favorite: meta.favorite,
      personal_note: meta.personalNote,
    })
    .from(dailyPicks)
    .innerJoin(campaigns, eq(campaigns.id, dailyPicks.campaignId))
    .leftJoin(
      meta,
      and(eq(meta.campaignId, campaigns.id), eq(meta.userId, userId))
    )
    .orderBy(desc(dailyPicks.date));

  return rows.map((row) => ({
    ...mapCampaign(row.campaign),
    pick_date: row.pick_date,
    rating: row.rating,
    favorite: row.favorite ?? 0,
    personal_note: row.personal_note,
  }));
}

export async function getArchiveFavoriteRows(
  userId: string
): Promise<
  Array<
    Campaign & {
      rating: number | null;
      favorite: number;
      personal_note: string | null;
    }
  >
> {
  const db = getDb();
  const rows = await db
    .select({
      campaign: campaigns,
      rating: meta.rating,
      favorite: meta.favorite,
      personal_note: meta.personalNote,
    })
    .from(campaigns)
    .innerJoin(meta, eq(meta.campaignId, campaigns.id))
    .where(and(eq(meta.favorite, 1), eq(meta.userId, userId)))
    .orderBy(sql`${meta.rating} DESC NULLS LAST`, asc(campaigns.title));

  return rows.map((row) => ({
    ...mapCampaign(row.campaign),
    rating: row.rating,
    favorite: row.favorite,
    personal_note: row.personal_note,
  }));
}

export async function getArchiveRatedRows(
  userId: string
): Promise<
  Array<
    Campaign & {
      rating: number | null;
      favorite: number;
      personal_note: string | null;
    }
  >
> {
  const db = getDb();
  const rows = await db
    .select({
      campaign: campaigns,
      rating: meta.rating,
      favorite: meta.favorite,
      personal_note: meta.personalNote,
    })
    .from(campaigns)
    .innerJoin(meta, eq(meta.campaignId, campaigns.id))
    .where(and(isNotNull(meta.rating), eq(meta.userId, userId)))
    .orderBy(desc(meta.rating), asc(campaigns.title));

  return rows.map((row) => ({
    ...mapCampaign(row.campaign),
    rating: row.rating,
    favorite: row.favorite,
    personal_note: row.personal_note,
  }));
}

export async function searchArchiveCampaignRows(
  query: string,
  limit = 20,
  userId?: string
): Promise<
  Array<
    Campaign & {
      pick_date: string | null;
      rating: number | null;
      favorite: number;
      personal_note: string | null;
    }
  >
> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const like = `%${q}%`;
  const db = getDb();
  const rows = await db
    .select({
      campaign: campaigns,
      pick_date: dailyPicks.date,
      rating: meta.rating,
      favorite: meta.favorite,
      personal_note: meta.personalNote,
    })
    .from(campaigns)
    .leftJoin(dailyPicks, eq(dailyPicks.campaignId, campaigns.id))
    .leftJoin(
      meta,
      userId
        ? and(eq(meta.campaignId, campaigns.id), eq(meta.userId, userId))
        : sql`false`
    )
    .where(
      sql`(
        lower(${campaigns.title}) LIKE ${like}
        OR lower(${campaigns.brand}) LIKE ${like}
        OR lower(${campaigns.agency}) LIKE ${like}
        OR lower(${campaigns.category}) LIKE ${like}
        OR lower(${campaigns.tier}) LIKE ${like}
        OR lower(COALESCE(${campaigns.insight}, '')) LIKE ${like}
        OR lower(COALESCE(${meta.personalNote}, '')) LIKE ${like}
      )`
    )
    .orderBy(
      sql`CASE WHEN ${dailyPicks.date} IS NOT NULL THEN 0 ELSE 1 END`,
      desc(dailyPicks.date),
      asc(campaigns.title)
    )
    .limit(limit);

  return rows.map((row) => ({
    ...mapCampaign(row.campaign),
    pick_date: row.pick_date,
    rating: row.rating,
    favorite: row.favorite ?? 0,
    personal_note: row.personal_note,
  }));
}

function mapProfile(row: typeof profiles.$inferSelect): Profile {
  return {
    id: row.id,
    displayName: row.displayName,
    username: row.username,
    creativeRole: row.creativeRole,
    creativeRoleOther: row.creativeRoleOther,
    avatarUrl: row.avatarUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getProfileByUserId(
  userId: string
): Promise<Profile | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  return rows[0] ? mapProfile(rows[0]) : null;
}

export async function getProfileByUsername(
  username: string
): Promise<Profile | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1);
  return rows[0] ? mapProfile(rows[0]) : null;
}

/** Profili pubblici completi, filtrabili per nome / username / ruolo. */
export async function searchProfiles(
  query = "",
  limit = 24
): Promise<Profile[]> {
  const db = getDb();
  const complete = and(
    isNotNull(profiles.username),
    isNotNull(profiles.displayName),
    isNotNull(profiles.creativeRole),
    sql`trim(${profiles.username}) <> ''`,
    sql`trim(${profiles.displayName}) <> ''`,
    sql`trim(${profiles.creativeRole}) <> ''`
  );

  const q = query.trim().toLowerCase();
  if (!q) {
    const rows = await db
      .select()
      .from(profiles)
      .where(complete)
      .orderBy(asc(profiles.displayName))
      .limit(limit);
    return rows.map(mapProfile);
  }

  const like = `%${q}%`;
  const rows = await db
    .select()
    .from(profiles)
    .where(
      and(
        complete,
        or(
          sql`lower(${profiles.displayName}) LIKE ${like}`,
          sql`lower(${profiles.username}) LIKE ${like}`,
          sql`lower(${profiles.creativeRole}) LIKE ${like}`,
          sql`lower(COALESCE(${profiles.creativeRoleOther}, '')) LIKE ${like}`
        )
      )
    )
    .orderBy(asc(profiles.displayName))
    .limit(limit);

  return rows.map(mapProfile);
}

export async function ensureProfileRow(
  userId: string
): Promise<Profile> {
  const existing = await getProfileByUserId(userId);
  if (existing) return existing;

  const db = getDb();
  await db.insert(profiles).values({ id: userId }).onConflictDoNothing();
  const created = await getProfileByUserId(userId);
  if (!created) throw new Error("Impossibile creare il profilo");
  return created;
}

export async function upsertProfile(input: {
  userId: string;
  displayName: string;
  username: string;
  creativeRole: string;
  creativeRoleOther: string | null;
  avatarUrl?: string | null;
}): Promise<Profile> {
  const db = getDb();
  await db
    .insert(profiles)
    .values({
      id: input.userId,
      displayName: input.displayName,
      username: input.username,
      creativeRole: input.creativeRole,
      creativeRoleOther: input.creativeRoleOther,
      avatarUrl: input.avatarUrl ?? null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        displayName: input.displayName,
        username: input.username,
        creativeRole: input.creativeRole,
        creativeRoleOther: input.creativeRoleOther,
        avatarUrl: input.avatarUrl ?? null,
        updatedAt: new Date(),
      },
    });

  const profile = await getProfileByUserId(input.userId);
  if (!profile) throw new Error("Profilo non trovato dopo il salvataggio");
  return profile;
}

export async function isUsernameTaken(
  username: string,
  excludeUserId?: string
): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1);
  if (rows.length === 0) return false;
  if (excludeUserId && rows[0].id === excludeUserId) return false;
  return true;
}

export async function ensureDatabaseReady(): Promise<void> {
  if (ready) return;

  getDb();
  await clearInvalidYoutubeGuesses();
  await migrateCampaignDetailsVersion();
  await ensureTodayPickValid();

  const count = await getCampaignCount();
  if (count === 0 && fs.existsSync(CACHE_PATH)) {
    await importFromCacheFile();
  }

  ready = true;
}
