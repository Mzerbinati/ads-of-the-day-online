import Image from "next/image";
import { fetchPreviewImage } from "@/lib/preview-image";
import { getVideoEmbed, isEmbeddableVideoUrl } from "@/lib/video";

interface CampaignMediaProps {
  url: string;
  title: string;
  brand: string;
  tier: string;
}

export async function CampaignMedia({
  url,
  title,
  brand,
  tier,
}: CampaignMediaProps) {
  if (isEmbeddableVideoUrl(url)) {
    const video = getVideoEmbed(url);
    return (
      <div className="video-shell">
        <div className="aspect-video w-full">
          <iframe
            src={video.embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    );
  }

  const preview = await fetchPreviewImage(url);

  if (preview) {
    return (
      <div className="glass-panel overflow-hidden">
        <div className="relative max-h-[560px] w-full bg-black/5">
          <Image
            src={preview}
            alt={title}
            width={1200}
            height={675}
            className="h-auto max-h-[560px] w-full object-contain"
            unoptimized
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/40 px-5 py-4">
          <p className="text-[13px] text-secondary">
            Materiali statici · {tier} · {brand}
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glass-ghost text-[13px]"
          >
            Apri case originale
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel px-6 py-10 text-center md:px-10">
      <p className="label mb-3">Case esterno</p>
      <h2 className="headline-sm mb-3">{title}</h2>
      <p className="mx-auto mb-6 max-w-md text-[15px] leading-relaxed text-secondary">
        Nessun video ufficiale nel catalogo per questa campagna. Apri il link
        originale per vedere immagini e materiali completi.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-glass"
      >
        Apri case originale
      </a>
    </div>
  );
}
