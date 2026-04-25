import { Link } from "react-router-dom";
import { getCountdownLabel, getEventAccent } from "@/features/events/showcase";
import { isEventBookable } from "@/features/events/utils";
import { cn } from "@/shared/lib/cn";
import { PosterImage } from "@/shared/ui/poster-image";
import { formatCurrency, formatDateRange } from "@/shared/lib/format";
import type { EventCardModel } from "@/features/events/types";

interface EventCardProps {
  event: EventCardModel;
  size?: "default" | "compact";
}

export function EventCard({ event, size = "default" }: EventCardProps) {
  const accent = getEventAccent(event.id);
  const isCompact = size === "compact";
  const bookable = isEventBookable(event.eventStatus);
  const actionLabel = bookable ? "예매하기" : "예매 종료";

  return (
    <Link
      to={`/events/${event.id}`}
      className="group block overflow-hidden rounded-card border border-border bg-surface shadow-card transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-panel"
    >
      <div className="relative p-2 pb-0">
        <PosterImage
          title={event.title}
          imageUrl={event.posterUrl}
          className={cn("aspect-[1.25/1] rounded-[10px]", isCompact && "aspect-[1.35/1] rounded-[9px]")}
        />
        <div className="absolute left-4 top-4 flex gap-1.5">
          <span className={`rounded-full px-2 py-1 text-[10px] font-black ${accent.color}`}>
            {accent.badge}
          </span>
          <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-zinc-700 shadow-card">
            {event.tags[0] ?? "공연"}
          </span>
        </div>
        <span className="absolute bottom-3 right-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-danger shadow-card">
          {getCountdownLabel(event.endDate)}
        </span>
      </div>
      <div className={cn("space-y-3 p-4", isCompact && "space-y-2.5 p-3")}>
        <div className="min-w-0">
          <h3
            className={cn(
              "line-clamp-2 min-h-12 break-keep text-base font-extrabold leading-6 text-foreground",
              isCompact && "min-h-10 text-[13px] leading-5",
            )}
          >
            {event.title}
          </h3>
          <p className={cn("mt-1 line-clamp-1 text-sm text-muted-foreground", isCompact && "text-xs")}>
            {event.venue} · {event.locationLabel}
          </p>
        </div>
        <div className={cn("space-y-1.5 text-sm text-muted-foreground", isCompact && "text-xs")}>
          <p>{formatDateRange(event.openDate, event.endDate)}</p>
          <p className="font-bold text-foreground">{event.priceLabel ?? formatCurrency(null)}</p>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_36px] gap-2">
          <span
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-button bg-zinc-950 px-3 text-sm font-bold text-white transition group-hover:bg-zinc-800",
              isCompact && "h-9 text-xs",
              !bookable && "bg-zinc-200 text-zinc-500 group-hover:bg-zinc-200",
            )}
          >
            {actionLabel}
          </span>
          <span
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-full border border-border bg-white text-lg text-zinc-700",
              isCompact && "h-9 text-base",
              !bookable && "text-zinc-300",
            )}
          >
            {bookable ? "+" : "-"}
          </span>
        </div>
      </div>
    </Link>
  );
}
