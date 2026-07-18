"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type HeaderUser = {
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
};

export function UserMenu({ user }: { user: HeaderUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function logout() {
    setOpen(false);
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

      <div className="relative" ref={rootRef}>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/55 bg-white/45 shadow-[0_8px_24px_rgba(15,17,23,0.08)] backdrop-blur-xl transition hover:bg-white/60"
        >
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[13px] font-semibold text-accent">{initial}</span>
          )}
        </button>

        {open && (
          <div
            id={menuId}
            role="menu"
            className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-[18px] border border-white/55 bg-white/70 p-1.5 shadow-[0_16px_40px_rgba(15,17,23,0.12)] backdrop-blur-2xl"
          >
            <div className="border-b border-white/40 px-3 py-2.5">
              <p className="truncate text-[14px] font-semibold text-text">
                {user.displayName}
              </p>
              {user.username && (
                <p className="truncate text-[12px] text-secondary">
                  @{user.username}
                </p>
              )}
            </div>

            {user.username && (
              <Link
                href={`/u/${user.username}`}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="mt-1 block rounded-[12px] px-3 py-2.5 text-[13px] text-secondary transition hover:bg-white/55 hover:text-text"
              >
                Il mio profilo pubblico
              </Link>
            )}

            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="block w-full rounded-[12px] px-3 py-2.5 text-left text-[13px] text-secondary transition hover:bg-white/55 hover:text-text"
            >
              Esci
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
