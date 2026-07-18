import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicFavoriteCard } from "@/components/PublicFavoriteCard";
import { SiteHeader } from "@/components/SiteHeader";
import { getAuthUser } from "@/lib/auth";
import {
  ensureDatabaseReady,
  getFavoriteCampaigns,
  getProfileByUserId,
  getProfileByUsername,
} from "@/lib/db";
import { isProfileComplete } from "@/lib/profile";
import { formatCreativeRole } from "@/lib/profile-display";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  await ensureDatabaseReady();

  const profile = await getProfileByUsername(username);
  if (!profile || !isProfileComplete(profile)) notFound();

  const favorites = await getFavoriteCampaigns(profile.id);
  const roleLabel = formatCreativeRole(profile);

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
        <div className="glass-panel mb-12 flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:p-10">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt=""
              className="h-24 w-24 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[28px] font-semibold text-accent">
              {(profile.displayName || "?").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="label mb-2">Profilo pubblico</p>
            <h1 className="headline mb-2 text-[36px] md:text-[42px]">
              {profile.displayName}
            </h1>
            <p className="text-[15px] text-secondary">@{profile.username}</p>
            {roleLabel && (
              <p className="mt-3 text-[15px] text-secondary">{roleLabel}</p>
            )}
          </div>
        </div>

        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="label mb-2">Raccolta</p>
              <h2 className="section-title">Preferiti</h2>
            </div>
            <span className="glass-chip px-3 py-1 text-[12px] font-medium text-secondary">
              {favorites.length}
            </span>
          </div>

          {favorites.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((item) => (
                <PublicFavoriteCard key={item.id} campaign={item} />
              ))}
            </div>
          ) : (
            <div className="empty-glass px-6 py-10 text-center">
              <p className="text-[15px] text-secondary">
                Nessun preferito pubblico ancora.
              </p>
            </div>
          )}
        </section>

        <Link href="/" className="btn-glass-ghost mt-12 inline-flex text-[14px]">
          ← Torna alla home
        </Link>
      </div>
    </>
  );
}
