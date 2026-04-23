import { Link } from "react-router-dom";
import { PosterImage } from "@/shared/ui/poster-image";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatDateRange } from "@/shared/lib/format";
import type { EventCardModel } from "@/features/events/types";

interface EventListItemProps {
  event: EventCardModel;
}

export function EventListItem({ event }: EventListItemProps) {
  return (
    <Link
      to={`/events/${event.id}`}
      className="flex gap-4 rounded-card border border-border bg-surface p-3 shadow-card transition hover:border-primary/20 hover:shadow-panel"
    >
      <PosterImage title={event.title} imageUrl={event.posterUrl} className="w-24 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-2 text-base font-semibold text-foreground">{event.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {event.venue} · {event.locationLabel}
            </p>
          </div>
          <StatusBadge label={event.statusLabel} tone={event.statusTone} />
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {event.description || "공연 소개 정보가 아직 등록되지 않았습니다."}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          {formatDateRange(event.openDate, event.endDate)}
        </p>
      </div>
    </Link>
  );
}
