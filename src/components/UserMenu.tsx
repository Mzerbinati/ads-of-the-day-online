"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type HeaderUser = {
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
};

export function UserMenu({ user }: { user: HeaderUser }) {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  const initial = (user.displayName || "?").slice(0, 1).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      {user.username ? (
        <Link
          href={`/u/${user.username}`}
          className="hidden text-[13px] text-secondary hover:text-text sm:block"
        >
          @{user.username}
        </Link>
      ) : null}
      <div className="glass-chip flex items-center gap-2 py-1 pr-2 pl-1">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-[13px] font-semibold text-accent">
            {initial}
          </span>
        )}
        <button
          type="button"
          onClick={logout}
          className="rounded-full px-2 py-1 text-[12px] font-medium text-secondary transition hover:bg-white/40 hover:text-text"
        >
          Esci
        </button>
      </div>
    </div>
  );
}
