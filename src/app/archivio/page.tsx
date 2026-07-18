import Link from "next/link";
import { CampaignCardWithDate } from "@/components/CampaignCard";
import { SiteHeader } from "@/components/SiteHeader";
import { requireCompleteProfile } from "@/lib/auth";
import {
  ensureDatabaseReady,
  getRecentDailyPicks,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ArchivioPage() {
  const { user, profile } = await requireCompleteProfile();
  await ensureDatabaseReady();
  const recent = await getRecentDailyPicks(60, user.id);

  return (
    <>
      <SiteHeader
        user={{
          displayName: profile.displayName || "Utente",
          username: profile.username,
          avatarUrl: profile.avatarUrl,
        }}
      />
      <div className="mx-auto max-w-[960px] px-6 pb-24 pt-8">
        <Link
          href="/"
          className="btn-glass-ghost mb-8 inline-flex text-[14px]"
        >
          ← Torna a oggi
        </Link>
        <p className="label mb-2">Archivio</p>
        <h1 className="section-title mb-8">Giorni precedenti</h1>

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
              Nessuna campagna precedente ancora.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
