import { eq } from "drizzle-orm";
import {
  SMALL_BRANDS_CURATED_CAMPAIGNS,
  SMALL_BRANDS_FOLDER_SLUG,
} from "../small-brands-curated";
import { getDb } from "./client";
import { appState, campaignFolders, campaigns, folders } from "./schema";

const SEED_STATE_KEY = "small_brands_curated_seed_version";
const SEED_VERSION = "1";

export async function ensureSmallBrandsCuratedFolder(): Promise<void> {
  const db = getDb();
  const rows = await db
    .select()
    .from(appState)
    .where(eq(appState.key, SEED_STATE_KEY))
    .limit(1);

  if (rows[0]?.value === SEED_VERSION) return;

  let folderId: number;
  const existingFolder = await db
    .select()
    .from(folders)
    .where(eq(folders.name, SMALL_BRANDS_FOLDER_SLUG))
    .limit(1);

  if (existingFolder[0]) {
    folderId = existingFolder[0].id;
  } else {
    const inserted = await db
      .insert(folders)
      .values({ name: SMALL_BRANDS_FOLDER_SLUG })
      .returning({ id: folders.id });
    folderId = inserted[0]!.id;
  }

  for (const item of SMALL_BRANDS_CURATED_CAMPAIGNS) {
    const existing = await db
      .select({ id: campaigns.id })
      .from(campaigns)
      .where(eq(campaigns.id, item.id))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(campaigns).values({
        id: item.id,
        title: item.title,
        brand: item.brand,
        agency: item.agency,
        year: item.year,
        tier: item.tier,
        category: item.category,
        url: item.url,
        raw: `curated:${SMALL_BRANDS_FOLDER_SLUG}`,
        team: item.team,
        idea: item.idea,
        insight: item.insight,
        board: item.board,
      });
    } else {
      await db
        .update(campaigns)
        .set({
          title: item.title,
          brand: item.brand,
          agency: item.agency,
          year: item.year,
          tier: item.tier,
          category: item.category,
          url: item.url,
          team: item.team,
          idea: item.idea,
          insight: item.insight,
          board: item.board,
        })
        .where(eq(campaigns.id, item.id));
    }

    await db
      .insert(campaignFolders)
      .values({ campaignId: item.id, folderId })
      .onConflictDoNothing();
  }

  await db
    .insert(appState)
    .values({ key: SEED_STATE_KEY, value: SEED_VERSION })
    .onConflictDoUpdate({
      target: appState.key,
      set: { value: SEED_VERSION },
    });
}
