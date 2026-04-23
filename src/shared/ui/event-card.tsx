import { Link } from "react-router-dom";
import { PosterImage } from "@/shared/ui/poster-image";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatCurrency, formatDateRange } from "@/shared/lib/format";
import type { EventCardModel } from "@/features/events/types";

interface EventCardProps {
  event: EventCardModel;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link
      to={`/events/${event.id}`}
      className="group overflow-hidden rounded-card border border-border bg-surface shadow-card transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-panel"
    >
      <PosterImage title={event.title} imageUrl={event.posterUrl} />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-base font-bold leading-6 text-foreground">
              {event.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {event.venue} · {event.locationLabel}
            </p>
          </div>
          <StatusBadge label={event.statusLabel} tone={event.statusTone} />
        </div>
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <p>{formatDateRange(event.openDate, event.endDate)}</p>
          <p>{event.priceLabel ?? "회차별 가격 정보 확인"}</p>
        </div>
        {event.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {event.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
