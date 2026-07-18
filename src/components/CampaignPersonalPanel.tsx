"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StarRating } from "./StarRating";

interface CampaignPersonalPanelProps {
  campaignId: string;
  initialRating: number | null;
  initialFavorite: boolean;
  initialNote: string | null;
}

export function CampaignPersonalPanel({
  campaignId,
  initialRating,
  initialFavorite,
  initialNote,
}: CampaignPersonalPanelProps) {
  const router = useRouter();
  const [rating, setRating] = useState(initialRating);
  const [favorite, setFavorite] = useState(initialFavorite);
  const [note, setNote] = useState(initialNote ?? "");
  const [saving, setSaving] = useState(false);

  async function patch(data: Record<string, unknown>) {
    await fetch(`/api/campaigns/${campaignId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.refresh();
  }

  async function updateRating(next: number | null) {
    setRating(next);
    await patch({ rating: next });
  }

  async function toggleFavorite() {
    const next = !favorite;
    setFavorite(next);
    await patch({ favorite: next });
  }

  async function saveNote() {
    setSaving(true);
    await patch({ personal_note: note.trim() || null });
    setSaving(false);
  }

  return (
    <div className="mt-8 space-y-5">
      <div className="glass-panel p-6 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="label mb-3">Valutazione</p>
            <StarRating value={rating} onChange={updateRating} />
          </div>
          <button
            type="button"
            onClick={toggleFavorite}
            className={`glass-chip px-4 py-2.5 text-[14px] font-medium transition-all ${
              favorite ? "glass-chip-active text-amber-700" : "text-secondary"
            }`}
          >
            {favorite ? "★ Nei preferiti" : "Aggiungi ai preferiti"}
          </button>
        </div>
      </div>

      <div className="glass-panel p-6 md:p-7">
        <p className="label mb-3">Nota personale</p>
        <p className="mb-4 text-[14px] leading-relaxed text-secondary">
          Scrivi cosa vuoi ricordare di questa campagna — insight, dettagli da
          rubare, contesto del brief.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={5}
          placeholder="Es. ottimo uso del contrasto visivo, idea da adattare per clienti FMCG…"
          className="glass-input mb-4 w-full resize-none px-4 py-3 text-[15px] leading-relaxed outline-none"
        />
        <button
          type="button"
          onClick={saveNote}
          disabled={saving}
          className="btn-glass"
        >
          {saving ? "Salvataggio…" : "Salva nota"}
        </button>
      </div>
    </div>
  );
}
