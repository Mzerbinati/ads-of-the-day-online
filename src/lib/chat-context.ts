import { formatItalianDateShort } from "./daily";
import {
  getArchiveFavoriteRows,
  getArchivePickRows,
  getArchiveRatedRows,
  searchArchiveCampaignRows,
} from "./db";
import type { Campaign } from "./types";

type ArchiveRow = Campaign & {
  pick_date: string | null;
  rating: number | null;
  favorite: number;
  personal_note: string | null;
};

export async function buildChatArchiveContext(): Promise<string> {
  const picks = await getArchivePickRows();
  const favorites = await getArchiveFavoriteRows();
  const rated = await getArchiveRatedRows();

  const lines: string[] = [
    `Archivio personale ADS of the day (${picks.length} campagne mostrate).`,
    "",
    "## Campagne del giorno (cronologia)",
  ];

  if (picks.length === 0) {
    lines.push("(Nessuna campagna mostrata ancora.)");
  } else {
    for (const p of picks) {
      const bits = [
        `${formatItalianDateShort(p.pick_date!)} · ${p.title}`,
        `Brand: ${p.brand}`,
        `Agenzia: ${p.agency}`,
        `Premio: ${p.tier} ${p.year}`,
        `Categoria: ${p.category}`,
      ];
      if (p.rating) bits.push(`Voto: ${p.rating}/5`);
      if (p.favorite) bits.push("Preferito: sì");
      if (p.personal_note?.trim()) bits.push(`Nota: ${p.personal_note.trim()}`);
      lines.push(`- ${bits.join(" · ")}`);
    }
  }

  lines.push("", "## Preferiti");
  if (favorites.length === 0) {
    lines.push("(Nessun preferito.)");
  } else {
    for (const f of favorites) {
      const bits = [
        f.title,
        `Brand: ${f.brand}`,
        `Agenzia: ${f.agency}`,
        `${f.tier} ${f.year}`,
      ];
      if (f.rating) bits.push(`Voto: ${f.rating}/5`);
      if (f.personal_note?.trim()) bits.push(`Nota: ${f.personal_note.trim()}`);
      lines.push(`- ${bits.join(" · ")}`);
    }
  }

  lines.push("", "## Valutazioni");
  if (rated.length === 0) {
    lines.push("(Nessuna valutazione.)");
  } else {
    for (const r of rated) {
      lines.push(
        `- ${r.rating}/5 · ${r.title} (${r.brand}, ${r.agency}, ${r.tier} ${r.year})`
      );
    }
  }

  return lines.join("\n");
}

export async function searchArchiveCampaigns(
  query: string,
  limit = 20
): Promise<string> {
  const q = query.trim().toLowerCase();
  if (!q) return "";

  const rows: ArchiveRow[] = await searchArchiveCampaignRows(query, limit);

  if (rows.length === 0) {
    return `Nessun risultato per "${query}".`;
  }

  return rows
    .map((r) => {
      const seen = r.pick_date
        ? `vista il ${formatItalianDateShort(r.pick_date)}`
        : "non ancora proposta come campagna del giorno";
      const bits = [
        r.title,
        r.brand,
        r.agency,
        `${r.tier} ${r.year}`,
        r.category,
        seen,
      ];
      if (r.rating) bits.push(`voto ${r.rating}/5`);
      if (r.favorite) bits.push("preferito");
      if (r.personal_note?.trim()) bits.push(`nota: ${r.personal_note.trim()}`);
      return `- ${bits.join(" · ")}`;
    })
    .join("\n");
}
