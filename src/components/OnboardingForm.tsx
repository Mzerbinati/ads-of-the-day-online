"use client";

import { CREATIVE_ROLES } from "@/lib/profile";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export function OnboardingForm({
  initialDisplayName = "",
  initialUsername = "",
}: {
  initialDisplayName?: string;
  initialUsername?: string;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [username, setUsername] = useState(initialUsername);
  const [creativeRole, setCreativeRole] = useState("");
  const [creativeRoleOther, setCreativeRoleOther] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const preview = useMemo(() => {
    if (!avatarFile) return null;
    return URL.createObjectURL(avatarFile);
  }, [avatarFile]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const body = new FormData();
      body.set("displayName", displayName);
      body.set("username", username);
      body.set("creativeRole", creativeRole);
      body.set("creativeRoleOther", creativeRoleOther);
      if (avatarFile) body.set("avatar", avatarFile);

      const res = await fetch("/api/profile", {
        method: "POST",
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Salvataggio non riuscito");
      }
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-lg space-y-5">
      <label className="block text-[13px] font-medium text-secondary">
        Nome visualizzato
        <input
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-2 w-full rounded-[14px] border border-white/50 bg-white/45 px-4 py-3 text-[15px] outline-none backdrop-blur-md focus:border-accent/40"
        />
      </label>

      <label className="block text-[13px] font-medium text-secondary">
        Username (per il profilo pubblico)
        <input
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="mario-rossi"
          className="mt-2 w-full rounded-[14px] border border-white/50 bg-white/45 px-4 py-3 text-[15px] outline-none backdrop-blur-md focus:border-accent/40"
        />
        <span className="mt-1 block text-[12px] text-tertiary">
          Diventerà /u/{username || "tuo-username"}
        </span>
      </label>

      <label className="block text-[13px] font-medium text-secondary">
        Ruolo nel mercato della creatività pubblicitaria
        <select
          required
          value={creativeRole}
          onChange={(e) => setCreativeRole(e.target.value)}
          className="mt-2 w-full rounded-[14px] border border-white/50 bg-white/45 px-4 py-3 text-[15px] outline-none backdrop-blur-md focus:border-accent/40"
        >
          <option value="" disabled>
            Seleziona…
          </option>
          {CREATIVE_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </label>

      {creativeRole === "Altro" && (
        <label className="block text-[13px] font-medium text-secondary">
          Specifica il ruolo
          <input
            required
            value={creativeRoleOther}
            onChange={(e) => setCreativeRoleOther(e.target.value)}
            className="mt-2 w-full rounded-[14px] border border-white/50 bg-white/45 px-4 py-3 text-[15px] outline-none backdrop-blur-md focus:border-accent/40"
          />
        </label>
      )}

      <label className="block text-[13px] font-medium text-secondary">
        Foto profilo (opzionale)
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
          className="mt-2 block w-full text-[13px] text-secondary"
        />
      </label>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Anteprima avatar"
          className="h-20 w-20 rounded-full object-cover"
        />
      )}

      {error && <p className="text-[14px] text-red-600">{error}</p>}

      <button type="submit" className="btn-glass w-full" disabled={saving}>
        {saving ? "Salvataggio…" : "Completa profilo"}
      </button>
    </form>
  );
}
