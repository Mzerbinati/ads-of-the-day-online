import { NextResponse } from "next/server";
import {
  ensureDatabaseReady,
  ensureProfileRow,
  setCampaignFavorite,
  setCampaignRating,
  setPersonalNote,
} from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    await ensureDatabaseReady();
    await ensureProfileRow(user.id);
    const { id } = await params;
    const body = await request.json();

    if ("rating" in body) {
      const rating = body.rating as number | null;
      if (rating !== null && (rating < 1 || rating > 5)) {
        return NextResponse.json({ error: "Voto non valido" }, { status: 400 });
      }
      await setCampaignRating(id, rating, user.id);
    }

    if ("favorite" in body) {
      await setCampaignFavorite(id, Boolean(body.favorite), user.id);
    }

    if ("personal_note" in body) {
      await setPersonalNote(id, body.personal_note as string | null, user.id);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
