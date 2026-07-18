import { getDb } from "./db";
import { formatItalianDateShort } from "./daily";
import type { Campaign } from "./types";

type ArchiveRow = Campaign & {
  pick_date: string | null;
  rating: number | null;
  favorite: number;
  personal_note: string | null;
};

export function buildChatArchiveContext(): string {
  const database = getDb();

  const picks = database
    .prepare(
      `
      SELECT c.*, dp.date as pick_date, m.rating, m.favorite, m.personal_note
      FROM daily_picks dp
      JOIN campaigns c ON c.id = dp.campaign_id
      LEFT JOIN meta m ON m.campaign_id = c.id
      ORDER BY dp.date DESC
    `
    )
    .all() as ArchiveRow[];

  const favorites = database
    .prepare(
      `
      SELECT c.*, m.rating, m.favorite, m.personal_note
      FROM campaigns c
      JOIN meta m ON m.campaign_id = c.id
      WHERE m.favorite = 1
      ORDER BY m.rating DESC NULLS LAST, c.title ASC
    `
    )
    .all() as Array<
    Campaign & {
      rating: number | null;
      favorite: number;
      personal_note: string | null;
    }
  >;

  const rated = database
    .prepare(
      `
      SELECT c.*, m.rating, m.favorite, m.personal_note
      FROM campaigns c
      JOIN meta m ON m.campaign_id = c.id
      WHERE m.rating IS NOT NULL
      ORDER BY m.rating DESC, c.title ASC
    `
    )
    .all() as Array<
    Campaign & {
      rating: number | null;
      favorite: number;
      personal_note: string | null;
    }
  >;

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

export function searchArchiveCampaigns(query: string, limit = 20): string {
  const q = query.trim().toLowerCase();
  if (!q) return "";

  const database = getDb();
  const like = `%${q}%`;

  const rows = database
    .prepare(
      `
      SELECT c.*, dp.date as pick_date, m.rating, m.favorite, m.personal_note
      FROM campaigns c
      LEFT JOIN daily_picks dp ON dp.campaign_id = c.id
      LEFT JOIN meta m ON m.campaign_id = c.id
      WHERE lower(c.title) LIKE ?
         OR lower(c.brand) LIKE ?
         OR lower(c.agency) LIKE ?
         OR lower(c.category) LIKE ?
         OR lower(c.tier) LIKE ?
         OR lower(COALESCE(c.insight, '')) LIKE ?
         OR lower(COALESCE(m.personal_note, '')) LIKE ?
      ORDER BY
        CASE WHEN dp.date IS NOT NULL THEN 0 ELSE 1 END,
        dp.date DESC,
        c.title ASC
      LIMIT ?
    `
    )
    .all(like, like, like, like, like, like, like, limit) as ArchiveRow[];

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
