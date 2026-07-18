import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { UserProfileCard } from "@/components/UserProfileCard";
import { getAuthUser } from "@/lib/auth";
import {
  ensureDatabaseReady,
  getProfileByUserId,
  searchProfiles,
} from "@/lib/db";
import { isProfileComplete } from "@/lib/profile";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  await ensureDatabaseReady();
  const results = await searchProfiles(q, 36);

  const viewer = await getAuthUser();
  const viewerProfile = viewer ? await getProfileByUserId(viewer.id) : null;

  return (
    <>
      <SiteHeader
        showLogin={!viewer}
        user={
          viewerProfile && isProfileComplete(viewerProfile)
            ? {
                displayName: viewerProfile.displayName || "Utente",
                username: viewerProfile.username,
                avatarUrl: viewerProfile.avatarUrl,
              }
            : null
        }
      />

      <div className="mx-auto max-w-[960px] px-6 pb-24 pt-10 md:pt-12">
        <p className="label mb-2">Community</p>
        <h1 className="section-title mb-3">Persone</h1>
        <p className="mb-8 max-w-xl text-[15px] text-secondary">
          Cerca creativi per nome, username o ruolo — apri il profilo pubblico
          da condividere su LinkedIn.
        </p>

        <form
          action="/utenti"
          method="get"
          className="glass-panel mb-10 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5"
        >
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Nome, @username o ruolo…"
            className="glass-input min-w-0 flex-1 px-4 py-3 text-[15px] outline-none"
          />
          <button type="submit" className="btn-glass shrink-0">
            Cerca
          </button>
        </form>

        <div className="mb-4 flex items-end justify-between gap-4">
          <p className="text-[13px] text-secondary">
            {q.trim()
              ? `Risultati per “${q.trim()}”`
              : "Profili pubblici"}
          </p>
          <span className="glass-chip px-3 py-1 text-[12px] font-medium text-secondary">
            {results.length}
          </span>
        </div>

        {results.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((profile) => (
              <UserProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <div className="empty-glass px-6 py-10 text-center">
            <p className="text-[15px] text-secondary">
              Nessun profilo trovato. Prova un altro termine.
            </p>
          </div>
        )}

        <Link href="/" className="btn-glass-ghost mt-12 inline-flex text-[14px]">
          ← Torna alla home
        </Link>
      </div>
    </>
  );
}
