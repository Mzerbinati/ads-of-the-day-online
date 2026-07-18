import { NextResponse } from "next/server";
import {
  ensureProfileRow,
  isUsernameTaken,
  upsertProfile,
} from "@/lib/db";
import {
  CREATIVE_ROLES,
  isValidUsername,
  slugifyUsername,
} from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    await ensureProfileRow(user.id);

    const form = await request.formData();
    const displayName = String(form.get("displayName") ?? "").trim();
    const username = slugifyUsername(String(form.get("username") ?? ""));
    const creativeRole = String(form.get("creativeRole") ?? "").trim();
    const creativeRoleOther = String(form.get("creativeRoleOther") ?? "").trim();
    const avatar = form.get("avatar");

    if (!displayName) {
      return NextResponse.json({ error: "Nome obbligatorio" }, { status: 400 });
    }
    if (!isValidUsername(username)) {
      return NextResponse.json(
        {
          error:
            "Username non valido: usa almeno 3 caratteri, solo lettere minuscole, numeri e trattini",
        },
        { status: 400 }
      );
    }
    if (!CREATIVE_ROLES.includes(creativeRole as (typeof CREATIVE_ROLES)[number])) {
      return NextResponse.json({ error: "Ruolo non valido" }, { status: 400 });
    }
    if (creativeRole === "Altro" && !creativeRoleOther) {
      return NextResponse.json(
        { error: "Specifica il ruolo se scegli Altro" },
        { status: 400 }
      );
    }
    if (await isUsernameTaken(username, user.id)) {
      return NextResponse.json(
        { error: "Username già in uso" },
        { status: 409 }
      );
    }

    let avatarUrl: string | null = null;
    if (avatar instanceof File && avatar.size > 0) {
      const ext = avatar.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar.${ext}`;
      const bytes = new Uint8Array(await avatar.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, bytes, {
          upsert: true,
          contentType: avatar.type || "image/jpeg",
        });
      if (uploadError) {
        return NextResponse.json(
          {
            error: `Upload avatar fallito: ${uploadError.message}. Crea il bucket "avatars" in Supabase Storage.`,
          },
          { status: 500 }
        );
      }
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      avatarUrl = data.publicUrl;
    }

    const profile = await upsertProfile({
      userId: user.id,
      displayName,
      username,
      creativeRole,
      creativeRoleOther: creativeRole === "Altro" ? creativeRoleOther : null,
      avatarUrl,
    });

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore salvataggio profilo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
