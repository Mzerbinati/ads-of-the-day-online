import Link from "next/link";
import { UserMenu } from "@/components/UserMenu";
import { formatItalianDate } from "@/lib/daily";

interface SiteHeaderProps {
  date?: string;
  user?: {
    displayName: string;
    username: string | null;
    avatarUrl: string | null;
  } | null;
  showLogin?: boolean;
}

export function SiteHeader({ date, user, showLogin }: SiteHeaderProps) {
  return (
    <header className="glass-bar sticky top-0 z-50">
      <div className="mx-auto flex max-w-[960px] items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="group">
          <p className="text-[11px] font-semibold tracking-[0.28em] text-tertiary uppercase">
            Creative archive
          </p>
          <p className="text-[22px] font-semibold tracking-tight text-text transition-opacity group-hover:opacity-70">
            ADS of the day
          </p>
        </Link>

        <div className="flex items-center gap-4">
          {date && (
            <p className="hidden text-right text-[13px] text-secondary capitalize sm:block">
              {formatItalianDate(date)}
            </p>
          )}
          {user ? (
            <UserMenu user={user} />
          ) : showLogin ? (
            <Link href="/login" className="btn-glass-ghost text-[13px]">
              Accedi
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
