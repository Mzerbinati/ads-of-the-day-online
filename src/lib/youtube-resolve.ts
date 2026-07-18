import yts from "yt-search";
import { getYouTubeId, getVimeoId } from "./video";

interface VideoResult {
  title: string;
  url: string;
  seconds: number;
}

export function isEmbeddableVideoUrl(url: string): boolean {
  return Boolean(getYouTubeId(url) || getVimeoId(url));
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

function significantWords(text: string): string[] {
  const stop = new Set([
    "the",
    "and",
    "for",
    "with",
    "from",
    "your",
    "you",
    "our",
    "new",
    "spot",
    "film",
    "brand",
    "official",
  ]);

  return normalize(text)
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w));
}

function scoreVideo(
  video: VideoResult,
  title: string,
  brand: string,
  agency: string
): number {
  const haystack = normalize(video.title);
  const titleWords = significantWords(title);
  const brandWords = significantWords(brand);
  const agencyWords = significantWords(agency).slice(0, 3);

  let titleHits = 0;
  for (const word of titleWords) {
    if (haystack.includes(word)) titleHits++;
  }

  let brandHits = 0;
  for (const word of brandWords) {
    if (haystack.includes(word)) brandHits++;
  }

  let agencyHits = 0;
  for (const word of agencyWords) {
    if (haystack.includes(word)) agencyHits++;
  }

  if (titleHits < 2) return -100;
  if (brandHits === 0) return -100;

  let score = titleHits * 6 + brandHits * 4 + agencyHits * 5;

  if (/commercial|advert|advertisement|spot|cannes|lion|\bad\b/i.test(haystack)) {
    score += 4;
  }
  if (/tutorial|how to|reaction|review|factory|guide|interview|podcast|unboxing/i.test(haystack)) {
    score -= 20;
  }
  if (video.seconds >= 15 && video.seconds <= 360) score += 2;

  return score;
}

function pickBestVideo(
  videos: VideoResult[],
  title: string,
  brand: string,
  agency: string
): VideoResult | null {
  const eligible = videos.filter((v) => v.seconds >= 10 && v.seconds <= 900);
  if (eligible.length === 0) return null;

  const ranked = [...eligible].sort(
    (a, b) =>
      scoreVideo(b, title, brand, agency) - scoreVideo(a, title, brand, agency)
  );

  const best = ranked[0];
  const score = best ? scoreVideo(best, title, brand, agency) : -1;

  if (!best || score < 14) return null;

  return best;
}

export async function searchYouTubeUrl(
  title: string,
  brand: string,
  agency: string,
  year: string
): Promise<string | null> {
  const agencyShort = agency.split(/[/\\]/)[0]?.split(/\s+/).slice(0, 2).join(" ") ?? agency;

  const queries = [
    `"${title}" ${brand} ${agencyShort} commercial`,
    `"${title}" ${brand} advert ${year}`,
    `${title} ${brand} ${agencyShort} Cannes Lions`,
  ];

  for (const query of queries) {
    try {
      const results = await yts(query);
      const candidate = pickBestVideo(results.videos, title, brand, agency);
      if (candidate) return candidate.url;
    } catch {
      continue;
    }
  }

  return null;
}
