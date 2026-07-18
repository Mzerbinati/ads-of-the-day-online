import type { Campaign } from "@/lib/types";

interface CampaignMetaProps {
  campaign: Campaign;
}

export function CampaignMeta({ campaign }: CampaignMetaProps) {
  const items = [
    campaign.tier,
    campaign.year,
    campaign.category,
    campaign.brand,
    campaign.agency,
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="glass-chip px-3 py-1 text-[12px] font-medium text-secondary">
          {item}
        </span>
      ))}
    </div>
  );
}
