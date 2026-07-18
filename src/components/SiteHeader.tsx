import Link from "next/link";
import { formatItalianDate } from "@/lib/daily";

interface SiteHeaderProps {
  date?: string;
}

export function SiteHeader({ date }: SiteHeaderProps) {
  return (
    <header className="glass-bar sticky top-0 z-50">
      <div className="mx-auto flex max-w-[960px] items-center justify-between px-6 py-4">
        <Link href="/" className="group">
          <p className="text-[11px] font-semibold tracking-[0.28em] text-tertiary uppercase">
            Creative archive
          </p>
          <p className="text-[22px] font-semibold tracking-tight text-text transition-opacity group-hover:opacity-70">
            ADS of the day
          </p>
        </Link>
        {date && (
          <p className="hidden text-right text-[13px] text-secondary capitalize sm:block">
            {formatItalianDate(date)}
          </p>
        )}
      </div>
    </header>
  );
}
