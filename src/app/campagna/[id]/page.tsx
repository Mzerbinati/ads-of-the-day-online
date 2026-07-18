import Link from "next/link";
import { notFound } from "next/navigation";
import { CampaignMedia } from "@/components/CampaignMedia";
import { CampaignMeta } from "@/components/CampaignMeta";
import { CampaignPersonalPanel } from "@/components/CampaignPersonalPanel";
import { SheetSection } from "@/components/SheetSection";
import { SiteHeader } from "@/components/SiteHeader";
import { requireCompleteProfile } from "@/lib/auth";
import { ensureDatabaseReady, getCampaignWithMeta } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user, profile } = await requireCompleteProfile();
  await ensureDatabaseReady();
  const { id } = await params;
  const campaign = await getCampaignWithMeta(id, user.id);

  if (!campaign) notFound();

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
          ← Home
        </Link>

        <div className="glass-panel mb-8 p-6 md:p-10">
          <header className="mb-8">
            <p className="label mb-4">Scheda campagna</p>
            <h1 className="headline-sm mb-5 max-w-3xl">{campaign.title}</h1>
            <CampaignMeta campaign={campaign} />
          </header>

          <CampaignMedia
            url={campaign.url}
            title={campaign.title}
            brand={campaign.brand}
            tier={campaign.tier}
          />
        </div>

        <div className="mb-2 grid gap-5 md:grid-cols-2">
          <SheetSection title="Persone">{campaign.team}</SheetSection>
          <SheetSection title="Agenzia e creativi">{campaign.idea}</SheetSection>
          <SheetSection title="Spiegazione progetto">{campaign.insight}</SheetSection>
          <SheetSection title="Altre info">{campaign.board}</SheetSection>
        </div>

        <CampaignPersonalPanel
          campaignId={campaign.id}
          initialRating={campaign.rating}
          initialFavorite={campaign.favorite}
          initialNote={campaign.personal_note}
        />
      </div>
    </>
  );
}
