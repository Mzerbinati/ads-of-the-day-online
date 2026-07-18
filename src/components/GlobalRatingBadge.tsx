import type { GlobalRating } from "@/lib/types";

export function formatGlobalRating(global: GlobalRating): string {
  if (!global.count || global.average == null) {
    return "Nessun voto ancora";
  }
  const avg = Math.round(global.average * 10) / 10;
  const votesLabel = global.count === 1 ? "1 voto" : `${global.count} voti`;
  return `${avg.toFixed(1)} su 5 — ${votesLabel}`;
}

export function GlobalRatingBadge({
  global,
  className = "",
}: {
  global: GlobalRating;
  className?: string;
}) {
  const empty = !global.count || global.average == null;

  return (
    <p
      className={`text-[13px] ${
        empty ? "text-tertiary" : "text-secondary"
      } ${className}`}
    >
      <span className="font-medium text-text/70">Voto globale · </span>
      {formatGlobalRating(global)}
    </p>
  );
}
