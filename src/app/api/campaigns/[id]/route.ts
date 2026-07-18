import { NextResponse } from "next/server";
import {
  ensureDatabaseReady,
  setCampaignFavorite,
  setCampaignRating,
  setPersonalNote,
} from "@/lib/db";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    ensureDatabaseReady();
    const { id } = await params;
    const body = await request.json();

    if ("rating" in body) {
      const rating = body.rating as number | null;
      if (rating !== null && (rating < 1 || rating > 5)) {
        return NextResponse.json({ error: "Voto non valido" }, { status: 400 });
      }
      setCampaignRating(id, rating);
    }

    if ("favorite" in body) {
      setCampaignFavorite(id, Boolean(body.favorite));
    }

    if ("personal_note" in body) {
      setPersonalNote(id, body.personal_note as string | null);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
