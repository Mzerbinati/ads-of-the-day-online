const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif)(\?|$)/i;

export async function fetchPreviewImage(pageUrl: string): Promise<string | null> {
  if (IMAGE_EXT.test(pageUrl)) return pageUrl;

  try {
    const response = await fetch(pageUrl, {
      headers: { "User-Agent": "ADS-of-the-day/1.0" },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;

    const html = await response.text();
    const patterns = [
      /property="og:image"[^>]+content="([^"]+)"/i,
      /content="([^"]+)"[^>]+property="og:image"/i,
      /name="twitter:image"[^>]+content="([^"]+)"/i,
      /content="([^"]+)"[^>]+name="twitter:image"/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return match[1].replace(/&amp;/g, "&");
    }
  } catch {
    return null;
  }

  return null;
}
