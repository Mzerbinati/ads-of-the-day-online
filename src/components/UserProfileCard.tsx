import Link from "next/link";
import type { Profile } from "@/lib/profile";
import { formatCreativeRole } from "@/lib/profile-display";

export function UserProfileCard({ profile }: { profile: Profile }) {
  const role = formatCreativeRole(profile);
  const initial = (profile.displayName || "?").slice(0, 1).toUpperCase();

  if (!profile.username) return null;

  return (
    <Link
      href={`/u/${profile.username}`}
      className="glass-card group flex items-center gap-4 p-4 transition-transform duration-300 hover:-translate-y-0.5"
    >
      {profile.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.avatarUrl}
          alt=""
          className="h-14 w-14 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[18px] font-semibold text-accent">
          {initial}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-[16px] font-semibold tracking-tight text-text">
          {profile.displayName}
        </p>
        <p className="truncate text-[13px] text-secondary">@{profile.username}</p>
        {role && (
          <p className="mt-1 truncate text-[13px] text-tertiary">{role}</p>
        )}
      </div>
    </Link>
  );
}
