import Link from "next/link";
import { CampaignCard } from "@/components/CampaignCard";
import { SiteHeader } from "@/components/SiteHeader";
import { requireCompleteProfile } from "@/lib/auth";
import {
  CANNES_CURATED_FOLDER_DESCRIPTION,
  CANNES_CURATED_FOLDER_SLUG,
  CANNES_CURATED_FOLDER_TITLE,
} from "@/lib/cannes-curated";
import { ensureDatabaseReady, getFolderCampaigns } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CannesCuratedPage() {
  const { user, profile } = await requireCompleteProfile();
  await ensureDatabaseReady();
  const items = await getFolderCampaigns(CANNES_CURATED_FOLDER_SLUG, user.id);

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

        <p className="label mb-2">Raccolta</p>
        <h1 className="section-title mb-4">{CANNES_CURATED_FOLDER_TITLE}</h1>
        <p className="mb-8 max-w-2xl text-[16px] leading-relaxed text-secondary">
          {CANNES_CURATED_FOLDER_DESCRIPTION}
        </p>

        <div className="glass-panel mb-10 p-6 md:p-8">
          <p className="label mb-4">Come analizzare</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Persone",
                text: "Brand client, agenzia, ruoli creativi e produzione.",
              },
              {
                title: "Agenzia e creativi",
                text: "Concept, meccanica creativa e execution.",
              },
              {
                title: "Spiegazione progetto",
                text: "Insight, brief, problema di categoria e perché funziona.",
              },
              {
                title: "Altre info",
                text: "Premi Cannes, formato, risultati e lezioni da portare in giuria.",
              },
            ].map((block) => (
              <div
                key={block.title}
                className="rounded-[16px] border border-white/40 bg-white/30 px-4 py-3"
              >
                <p className="mb-1 text-[13px] font-semibold text-text">
                  {block.title}
                </p>
                <p className="text-[14px] leading-relaxed text-secondary">
                  {block.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-[18px] font-semibold tracking-tight text-text">
            {items.length} campagne
          </h2>
          <span className="glass-chip px-3 py-1 text-[12px] font-medium text-secondary">
            2015 – 2025
          </span>
        </div>

        {items.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <CampaignCard key={item.id} campaign={item} />
            ))}
          </div>
        ) : (
          <div className="empty-glass px-6 py-10 text-center">
            <p className="text-[15px] text-secondary">
              Raccolta in caricamento — ricarica tra qualche secondo.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
