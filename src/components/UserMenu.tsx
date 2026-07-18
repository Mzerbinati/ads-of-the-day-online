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
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/utenti"
        className="hidden text-[13px] text-secondary transition hover:text-text md:block"
      >
        Persone
      </Link>
      {user.username ? (
        <Link
          href={`/u/${user.username}`}
          className="btn-glass-ghost hidden text-[12px] sm:inline-flex"
          title="Copia questo link per LinkedIn"
        >
          Il mio profilo pubblico
        </Link>
      ) : null}
      <div className="glass-chip flex items-center gap-2 py-1 pr-2 pl-1">
        {user.username ? (
          <Link href={`/u/${user.username}`} className="flex items-center gap-2">
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
            <span className="hidden max-w-[7rem] truncate text-[12px] text-secondary lg:inline">
              @{user.username}
            </span>
          </Link>
        ) : user.avatarUrl ? (
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
