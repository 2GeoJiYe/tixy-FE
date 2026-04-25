import { useMemo, useState } from "react";
import { cn } from "@/shared/lib/cn";

interface PosterImageProps {
  title: string;
  imageUrl?: string | null;
  className?: string;
}

export function PosterImage({ title, imageUrl, className }: PosterImageProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const displayTitle = useMemo(() => title.split(/\s+/).slice(0, 4).join("\n"), [title]);
  const shouldShowFallback = !imageUrl || imageFailed;

  return (
    <div
      className={cn(
        "relative aspect-[2/3] overflow-hidden rounded-card border border-border bg-zinc-100",
        className,
      )}
    >
      {shouldShowFallback ? (
        <div className="relative h-full w-full overflow-hidden bg-[linear-gradient(145deg,#f8f8f8,#d8d8d8)] p-4 text-zinc-500">
          <div className="absolute -bottom-10 -right-8 h-36 w-36 rounded-full bg-zinc-300/75 md:h-44 md:w-44" />
          <div className="absolute bottom-10 left-0 h-20 w-28 bg-white/40 [clip-path:polygon(0_100%,100%_100%,100%_74%,0_74%,0_52%,72%_52%,72%_26%,0_26%)]" />
          <div className="absolute right-8 top-12 h-32 w-24 rounded-t-full border-[14px] border-white/55 border-b-0" />
          <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.72),transparent_24%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/90">
              TIXY LIVE
            </span>
            <p className="whitespace-pre-line text-3xl font-light leading-none text-white/95 drop-shadow-sm md:text-4xl">
              {displayTitle}
            </p>
          </div>
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      )}
    </div>
  );
}
