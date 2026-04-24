import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useEventDetailQuery } from "@/features/events/api/events";
import { toEventCardModel } from "@/features/events/utils";
import { formatDateRange } from "@/shared/lib/format";
import { useStickyPageAction } from "@/shared/hooks/use-sticky-page-action";
import { AppErrorState } from "@/shared/ui/app-error-state";
import { AuthRequiredNotice } from "@/shared/ui/auth-required-notice";
import { Button } from "@/shared/ui/button";
import { PosterImage } from "@/shared/ui/poster-image";
import { StatusBadge } from "@/shared/ui/status-badge";

export function EventDetailPage() {
  const params = useParams();
  const eventId = Number(params.eventId);
  const query = useEventDetailQuery(eventId, true);
  const event = useMemo(() => (query.data ? toEventCardModel(query.data) : null), [query.data]);
  const unauthorized = query.error && "status" in query.error && query.error.status === 401;

  useStickyPageAction(
    event ? (
      <Link to={`/events/${event.id}/sessions`} className="block">
        <Button fullWidth>회차 선택</Button>
      </Link>
    ) : null,
    Boolean(event),
  );

  if (query.isLoading) {
    return <div className="h-96 animate-pulse rounded-card bg-muted" />;
  }

  if (unauthorized) {
    return <AuthRequiredNotice />;
  }

  if (query.isError || !event) {
    return <AppErrorState description="공연 정보를 불러오지 못했습니다." onRetry={() => query.refetch()} />;
  }

  const summaryItems = [
    { label: "공연장", value: event.venue },
    { label: "지역", value: event.locationLabel },
    { label: "기간", value: formatDateRange(event.openDate, event.endDate) },
    { label: "상태", value: event.statusLabel },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="xl:sticky xl:top-24">
        <PosterImage className="max-w-sm" title={event.title} imageUrl={event.posterUrl} />
      </div>

      <section className="rounded-card border border-border bg-surface shadow-card">
        <div className="border-b border-border px-6 py-6 md:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge label={event.statusLabel} tone={event.statusTone} />
            <span className="text-sm text-muted-foreground">{event.locationLabel}</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-foreground md:text-[2rem]">{event.title}</h1>
        </div>

        <div className="grid gap-3 border-b border-border px-6 py-6 md:grid-cols-2 md:px-8 xl:grid-cols-4">
          {summaryItems.map((item) => (
            <div key={item.label} className="rounded-card border border-border bg-panel px-4 py-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="px-6 py-6 md:px-8">
          <h2 className="text-base font-semibold text-foreground">공연 소개</h2>
          <div className="mt-4 rounded-card bg-panel px-5 py-5 text-sm leading-7 text-muted-foreground">
            <p className="whitespace-pre-line">
              {event.description || "등록된 소개가 없습니다."}
            </p>
          </div>
        </div>

        <div className="hidden border-t border-border px-6 py-6 md:block md:px-8">
          <Link to={`/events/${event.id}/sessions`}>
            <Button>회차 선택</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
