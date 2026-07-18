import Link from "next/link";
import { CampaignCard, CampaignCardWithDate } from "@/components/CampaignCard";
import { CampaignMedia } from "@/components/CampaignMedia";
import { SiteHeader } from "@/components/SiteHeader";
import { formatItalianDate } from "@/lib/daily";
import {
  ensureDatabaseReady,
  getFavoriteCampaigns,
  getOrCreateTodayPick,
  getRecentDailyPicks,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  ensureDatabaseReady();
  const { date, campaign } = getOrCreateTodayPick();
  const recent = getRecentDailyPicks(12);
  const favorites = getFavoriteCampaigns();

  if (!campaign) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="text-[15px] text-secondary">Catalogo vuoto.</p>
      </div>
    );
  }

  return (
    <>
      <SiteHeader date={date} />

      <div className="mx-auto max-w-[960px] px-6 pb-24 pt-8 md:pt-12">
        {/* Oggi */}
        <section className="glass-panel mb-14 overflow-hidden p-6 md:p-10">
          <p className="label mb-6">Oggi · {formatItalianDate(date)}</p>

          <div className="mb-8">
            <p className="mb-4 text-[13px] font-medium tracking-wide text-accent uppercase">
              {campaign.tier} · {campaign.year}
            </p>
            <h1 className="headline mb-4 max-w-3xl">{campaign.title}</h1>
            <p className="text-[18px] text-secondary">
              {campaign.brand}
              <span className="text-tertiary"> · </span>
              {campaign.agency}
            </p>
          </div>

          <CampaignMedia
            url={campaign.url}
            title={campaign.title}
            brand={campaign.brand}
            tier={campaign.tier}
          />

          <Link
            href={`/campagna/${campaign.id}`}
            className="btn-glass mt-8 inline-flex"
          >
            Apri scheda
          </Link>
        </section>

        {/* Preferiti */}
        <section className="mb-14">
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
                <CampaignCard key={item.id} campaign={item} />
              ))}
            </div>
          ) : (
            <div className="empty-glass px-6 py-10 text-center">
              <p className="text-[15px] text-secondary">
                Nessun preferito ancora. Aggiungili dalla scheda campagna.
              </p>
            </div>
          )}
        </section>

        {/* Giorni precedenti */}
        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="label mb-2">Archivio</p>
              <h2 className="section-title">Giorni precedenti</h2>
            </div>
            <span className="glass-chip px-3 py-1 text-[12px] font-medium text-secondary">
              {recent.length}
            </span>
          </div>

          {recent.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((item) => (
                <CampaignCardWithDate
                  key={item.pick_date}
                  campaign={{ ...item, pick_date: item.pick_date! }}
                />
              ))}
            </div>
          ) : (
            <div className="empty-glass px-6 py-10 text-center">
              <p className="text-[15px] text-secondary">
                Torna domani — qui troverai le campagne dei giorni scorsi.
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
