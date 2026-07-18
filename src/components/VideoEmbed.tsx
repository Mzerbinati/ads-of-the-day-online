import { getVideoEmbed, isEmbeddableVideoUrl } from "@/lib/video";

interface VideoEmbedProps {
  url: string;
  title: string;
  originalUrl?: string;
}

export function VideoEmbed({ url, title, originalUrl }: VideoEmbedProps) {
  const video = getVideoEmbed(url);
  const resolved = isEmbeddableVideoUrl(url);

  if (!resolved) {
    return (
      <div className="empty-glass flex aspect-video w-full flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="max-w-sm text-[15px] leading-relaxed text-secondary">
          Questa campagna non ha un video YouTube/Vimeo nel catalogo. Apri il
          case originale dal link ufficiale.
        </p>
        {originalUrl && (
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glass"
          >
            Apri case originale
          </a>
        )}
      </div>
    );
  }

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
