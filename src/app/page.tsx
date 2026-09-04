import Link from "next/link";
import { CampaignCard, CampaignCardWithDate } from "@/components/CampaignCard";
import { CampaignMedia } from "@/components/CampaignMedia";
import { LoginForm } from "@/components/LoginForm";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentProfile, requireCompleteProfile } from "@/lib/auth";
import { formatItalianDate } from "@/lib/daily";
import {
  ensureDatabaseReady,
  getFavoriteCampaigns,
  getOrCreateTodayPick,
  getRecentDailyPicks,
} from "@/lib/db";
import { isProfileComplete } from "@/lib/profile";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function LandingPage() {
  return (
    <>
      <SiteHeader showLogin />
      <div className="mx-auto flex min-h-[calc(100vh-88px)] max-w-[960px] flex-col justify-center px-6 py-16">
        <section className="glass-panel overflow-hidden p-8 md:p-12">
          <p className="label mb-4">Creative archive</p>
          <h1 className="headline mb-5 max-w-2xl">ADS of the day</h1>
          <p className="mb-10 max-w-xl text-[17px] leading-relaxed text-secondary">
            Una campagna pubblicitaria al giorno, scelta dall&apos;archivio. Accedi
            per vedere oggi, i due giorni precedenti e il tuo spazio personale di
            voti, note e preferiti.
          </p>
          <LoginForm />
        </section>
      </div>
    </>
  );
}

export default async function HomePage() {
  const current = await getCurrentProfile();

  if (!current) {
    return <LandingPage />;
  }

  if (!isProfileComplete(current.profile)) {
    redirect("/onboarding");
  }

  const { user, profile } = await requireCompleteProfile();

  await ensureDatabaseReady();
  const { date, campaign } = await getOrCreateTodayPick();
  const recent = await getRecentDailyPicks(2, user.id);
  const favorites = await getFavoriteCampaigns(user.id);

  if (!campaign) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="text-[15px] text-secondary">Catalogo vuoto.</p>
      </div>
    );
  }

  const headerUser = {
    displayName: profile.displayName || "Utente",
    username: profile.username,
    avatarUrl: profile.avatarUrl,
  };

  return (
    <>
      <SiteHeader date={date} user={headerUser} />

      <div className="mx-auto max-w-[960px] px-6 pb-24 pt-8 md:pt-12">
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

        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="label mb-2">Archivio</p>
              <h2 className="section-title">Ultimi due giorni</h2>
            </div>
            <Link
              href="/archivio"
              className="glass-chip px-3 py-1 text-[12px] font-medium text-secondary transition hover:text-text"
            >
              Vedi archivio
            </Link>
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
