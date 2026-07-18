import Image from "next/image";
import Link from "next/link";
import type { CampaignListItem } from "@/lib/types";
import { getCampaignThumbnail } from "@/lib/video";

/** Card pubblica: preferito di un utente, con il suo voto (mai la nota). */
export function PublicFavoriteCard({
  campaign,
}: {
  campaign: CampaignListItem;
}) {
  const thumb = getCampaignThumbnail(campaign);

  return (
    <Link href={`/campagna/${campaign.id}`} className="glass-card group block">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] bg-black/5">
        {thumb ? (
          <Image
            src={thumb}
            alt={campaign.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
            <p className="text-[11px] tracking-wide text-tertiary uppercase">
              {campaign.tier}
            </p>
            <p className="line-clamp-2 text-[13px] font-medium text-secondary">
              {campaign.title}
            </p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute right-3 bottom-3 left-3">
          <p className="text-[11px] font-medium tracking-wide text-white/80 uppercase">
            {campaign.tier} · {campaign.year}
          </p>
        </div>
      </div>
      <div className="p-4">
        <h3 className="mb-1 line-clamp-2 text-[15px] leading-snug font-semibold tracking-tight text-text">
          {campaign.title}
        </h3>
        <p className="text-[13px] text-secondary">
          {campaign.brand} · {campaign.agency}
        </p>
        {campaign.rating ? (
          <p className="mt-2 text-[12px] text-amber-700/90">
            Il suo voto · {"★".repeat(campaign.rating)}
            {"☆".repeat(5 - campaign.rating)}
          </p>
        ) : (
          <p className="mt-2 text-[12px] text-tertiary">Preferito · senza voto</p>
        )}
      </div>
    </Link>
  );
}
