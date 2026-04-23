import { useMemo, useState } from "react";
import { cn } from "@/shared/lib/cn";

interface PosterImageProps {
  title: string;
  imageUrl?: string | null;
  className?: string;
}

export function PosterImage({ title, imageUrl, className }: PosterImageProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const placeholderText = useMemo(() => (title ? title.slice(0, 1).toUpperCase() : "P"), [title]);
  const shouldShowFallback = !imageUrl || imageFailed;

  return (
    <div
      className={cn(
        "relative aspect-[2/3] overflow-hidden rounded-card border border-border bg-gradient-to-b from-slate-200 to-slate-100",
        className,
      )}
    >
      {shouldShowFallback ? (
        <div className="flex h-full w-full flex-col justify-between bg-[linear-gradient(180deg,rgba(255,255,255,0.68),rgba(226,232,240,0.92))] p-4 text-slate-500">
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em]">Poster</span>
          <div>
            <div className="mb-3 text-5xl font-semibold text-slate-400">{placeholderText}</div>
            <p className="line-clamp-3 text-sm font-medium text-slate-600">{title}</p>
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
