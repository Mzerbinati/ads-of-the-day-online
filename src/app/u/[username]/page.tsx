import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { getAuthUser } from "@/lib/auth";
import { getProfileByUserId, getProfileByUsername } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile || !profile.username) notFound();

  const viewer = await getAuthUser();
  const viewerProfile = viewer ? await getProfileByUserId(viewer.id) : null;

  const roleLabel =
    profile.creativeRole === "Altro"
      ? profile.creativeRoleOther || "Altro"
      : profile.creativeRole;

  return (
    <>
      <SiteHeader
        showLogin={!viewer}
        user={
          viewerProfile
            ? {
                displayName: viewerProfile.displayName || "Utente",
                username: viewerProfile.username,
                avatarUrl: viewerProfile.avatarUrl,
              }
            : null
        }
      />
      <div className="mx-auto max-w-[960px] px-6 pb-24 pt-12">
        <div className="glass-panel flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:p-10">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt=""
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent/15 text-[28px] font-semibold text-accent">
              {(profile.displayName || "?").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="label mb-2">Profilo</p>
            <h1 className="headline mb-2 text-[36px]">
              {profile.displayName}
            </h1>
            <p className="text-[15px] text-secondary">@{profile.username}</p>
            {roleLabel && (
              <p className="mt-3 text-[15px] text-secondary">{roleLabel}</p>
            )}
          </div>
        </div>
        <Link href="/" className="btn-glass-ghost mt-8 inline-flex text-[14px]">
          ← Torna alla home
        </Link>
      </div>
    </>
  );
}
