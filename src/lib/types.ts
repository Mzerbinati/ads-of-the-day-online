export type CampaignStatus = "inbox" | "studied" | "reference";

export interface Campaign {
  id: string;
  title: string;
  brand: string;
  agency: string;
  year: string;
  tier: string;
  category: string;
  url: string;
  raw: string;
  added_at: string;
  analysis: string | null;
  transcript: string | null;
  team: string | null;
  idea: string | null;
  insight: string | null;
  board: string | null;
  youtube_url: string | null;
}

export interface CampaignInput {
  id: string;
  title: string;
  brand: string;
  agency: string;
  year: string;
  tier: string;
  category: string;
  url: string;
  raw: string;
}

export interface CampaignListItem extends Campaign {
  rating: number | null;
  favorite: boolean;
  pick_date?: string;
}

export interface CampaignWithMeta extends Campaign {
  rating: number | null;
  favorite: boolean;
  personal_note: string | null;
}

export interface ImportResult {
  inserted: number;
  updated: number;
  total: number;
  source: "cache" | "scraper";
}

export interface CatalogStats {
  count: number;
  cacheFileExists: boolean;
  dbReady: boolean;
}
