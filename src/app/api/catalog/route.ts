import { NextResponse } from "next/server";
import {
  ensureDatabaseReady,
  getCatalogStats,
  importCampaigns,
  importFromCacheFile,
} from "@/lib/db";
import { scrapeCatalog } from "@/lib/scraper";

export const runtime = "nodejs";

export async function GET() {
  try {
    await ensureDatabaseReady();
    const stats = await getCatalogStats();
    return NextResponse.json(stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore database";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDatabaseReady();
    const body = await request.json().catch(() => ({}));
    const source = body.source === "cache" ? "cache" : "scraper";

    if (source === "cache") {
      const result = await importFromCacheFile();
      if (!result) {
        return NextResponse.json(
          { error: "File data/campaigns_cache.json non trovato" },
          { status: 404 }
        );
      }
      return NextResponse.json(result);
    }

    const campaigns = await scrapeCatalog();
    if (campaigns.length === 0) {
      return NextResponse.json(
        { error: "Nessuna campagna trovata durante lo scraping" },
        { status: 422 }
      );
    }

    const result = await importCampaigns(campaigns, "scraper");
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore durante l'import";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
