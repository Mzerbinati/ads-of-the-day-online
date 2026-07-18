import type { CampaignInput } from "./types";
import { preferVideoUrl } from "./video";

const BASE_URL = "https://lovetheworkmore.com";
const YEAR_LINK_RE =
  /href="(https:\/\/lovetheworkmore\.com\/(\d{4}(?:-\d+)?)\/|\/(\d{4}(?:-\d+)?)\/)"/gi;

const LINK_RE =
  /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;

function decodeHtml(text: string): string {
  return text
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function extractYearFromSlug(slug: string): string {
  const rangeMatch = slug.match(/^(\d{4})-(\d{4})$/);
  if (rangeMatch) return `${rangeMatch[1]}-${rangeMatch[2]}`;
  const yearMatch = slug.match(/^(\d{4})/);
  return yearMatch?.[1] ?? slug;
}

function detectTierFromHeader(header: string): string | null {
  const normalized = header.toUpperCase().replace(/\s+/g, " ").trim();
  if (normalized.includes("GRAND PRIX") && normalized.includes("TITANIUM")) {
    return "TITANIUM";
  }
  if (normalized === "GOLD") return "GOLD";
  if (normalized === "SILVER") return "SILVER";
  if (normalized === "BRONZE") return "BRONZE";
  if (normalized.includes("GRAND PRIX")) return "GRAND PRIX";
  if (normalized.includes("TITANIUM")) return "TITANIUM";
  return null;
}

function detectTierFromCategory(category: string, sectionTier: string): string {
  const upper = category.toUpperCase();
  if (upper.includes("GRAND PRIX")) return "GRAND PRIX";
  if (upper.includes("TITANIUM")) return "TITANIUM";
  return sectionTier;
}

function parseCampaignLine(
  raw: string,
  year: string,
  sectionTier: string,
  url: string
): CampaignInput | null {
  const cleaned = decodeHtml(raw);
  if (!cleaned || cleaned.length < 5) return null;

  let category = "GENERAL";
  let rest = cleaned;

  const bracketMatch = cleaned.match(/^\[([^\]]+)\]\s*(.+)$/);
  if (bracketMatch) {
    category = bracketMatch[1].trim();
    rest = bracketMatch[2].trim();
  }

  const mainMatch = rest.match(/^(.+?)\s*[–—-]\s*(.+?)\s*\(([^)]+)\)\s*$/);
  if (!mainMatch) return null;

  const title = mainMatch[1].trim();
  const brand = mainMatch[2].trim();
  const agency = mainMatch[3].trim();

  if (!title || !brand) return null;

  const tier = detectTierFromCategory(category, sectionTier);
  const id = `${year}-${slugify(title)}`;

  return {
    id,
    title,
    brand,
    agency,
    year,
    tier,
    category,
    url,
    raw: cleaned,
  };
}

function parseYearPage(html: string, year: string): CampaignInput[] {
  const pending = new Map<string, CampaignInput>();
  let currentTier = "TITANIUM";

  const blocks = html.split(/<div class="et_pb_text_inner">/i).slice(1);

  for (const block of blocks) {
    const blockContent = block.split("</div>")[0] ?? "";

    const headerMatch = blockContent.match(
      /<(?:p|span)[^>]*>([\s\S]*?)<\/(?:p|span)>/i
    );
    if (headerMatch) {
      const headerText = decodeHtml(headerMatch[1]);
      const detected = detectTierFromHeader(headerText);
      if (detected) {
        currentTier = detected;
      }
    }

    let linkMatch: RegExpExecArray | null;
    const linkRe = new RegExp(LINK_RE.source, LINK_RE.flags);
    while ((linkMatch = linkRe.exec(blockContent)) !== null) {
      const url = linkMatch[1].replace(/&amp;/g, "&");
      const linkText = linkMatch[2];

      if (url.includes("lovetheworkmore.com")) continue;
      if (url.startsWith("mailto:")) continue;

      const campaign = parseCampaignLine(linkText, year, currentTier, url);
      if (!campaign) continue;

      const existing = pending.get(campaign.id);
      if (!existing) {
        pending.set(campaign.id, campaign);
        continue;
      }

      existing.url = preferVideoUrl([existing.url, url]);
    }
  }

  return Array.from(pending.values());
}

async function fetchYearUrls(): Promise<Array<{ url: string; year: string }>> {
  const response = await fetch(BASE_URL, {
    headers: { "User-Agent": "ADS-of-the-day/1.0 (local creative archive)" },
  });

  if (!response.ok) {
    throw new Error(`Impossibile raggiungere ${BASE_URL}: ${response.status}`);
  }

  const html = await response.text();
  const urls = new Map<string, string>();

  let match: RegExpExecArray | null;
  const re = new RegExp(YEAR_LINK_RE.source, YEAR_LINK_RE.flags);
  while ((match = re.exec(html)) !== null) {
    const full = match[1].startsWith("http")
      ? match[1]
      : `${BASE_URL}${match[1]}`;
    const slug = match[2] ?? match[3];
    if (!slug) continue;
    urls.set(full, extractYearFromSlug(slug));
  }

  return Array.from(urls.entries()).map(([url, year]) => ({ url, year }));
}

export async function scrapeCatalog(): Promise<CampaignInput[]> {
  const yearUrls = await fetchYearUrls();

  if (yearUrls.length === 0) {
    throw new Error("Nessuna pagina anno trovata sulla homepage");
  }

  const allCampaigns: CampaignInput[] = [];
  const seenIds = new Set<string>();

  for (const { url, year } of yearUrls) {
    const response = await fetch(url, {
      headers: { "User-Agent": "ADS-of-the-day/1.0 (local creative archive)" },
    });

    if (!response.ok) {
      console.warn(`Salto ${url}: HTTP ${response.status}`);
      continue;
    }

    const html = await response.text();
    const pageCampaigns = parseYearPage(html, year);

    for (const campaign of pageCampaigns) {
      if (seenIds.has(campaign.id)) continue;
      seenIds.add(campaign.id);
      allCampaigns.push(campaign);
    }
  }

  return allCampaigns;
}
