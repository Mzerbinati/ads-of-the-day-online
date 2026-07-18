import type { Campaign } from "./types";

export function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match?.[1] ?? null;
}

export function isEmbeddableVideoUrl(url: string): boolean {
  return Boolean(getYouTubeId(url) || getVimeoId(url));
}

export function preferVideoUrl(urls: string[]): string {
  const youtube = urls.find((u) => getYouTubeId(u));
  if (youtube) return youtube;

  const vimeo = urls.find((u) => getVimeoId(u));
  if (vimeo) return vimeo;

  return urls[0] ?? "";
}

/** Usa solo il link del catalogo se è un video reale — mai guess YouTube salvati. */
export function resolveCampaignVideoUrl(campaign: Pick<Campaign, "url">): string {
  if (isEmbeddableVideoUrl(campaign.url)) {
    return campaign.url;
  }
  return campaign.url;
}

export function getCampaignThumbnail(
  campaign: Pick<Campaign, "url">
): string | null {
  const videoUrl = resolveCampaignVideoUrl(campaign);
  const yt = getYouTubeThumbnail(videoUrl);
  if (yt) return yt;

  const vimeoId = getVimeoId(videoUrl);
  if (vimeoId) return `https://vumbnail.com/${vimeoId}.jpg`;

  return null;
}

export function getVideoEmbed(url: string): {
  type: "youtube" | "vimeo" | "external";
  embedUrl?: string;
  externalUrl: string;
} {
  const ytId = getYouTubeId(url);
  if (ytId) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${ytId}`,
      externalUrl: url,
    };
  }

  const vimeoId = getVimeoId(url);
  if (vimeoId) {
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      externalUrl: url,
    };
  }

  return { type: "external", externalUrl: url };
}

export function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}
