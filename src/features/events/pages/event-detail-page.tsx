import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import { useEventDetailQuery } from "@/features/events/api/events";
import { toEventCardModel } from "@/features/events/utils";
import { AppErrorState } from "@/shared/ui/app-error-state";
import { AuthRequiredNotice } from "@/shared/ui/auth-required-notice";
import { Button } from "@/shared/ui/button";
import { PosterImage } from "@/shared/ui/poster-image";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatDateRange } from "@/shared/lib/format";
import { useStickyPageAction } from "@/shared/hooks/use-sticky-page-action";

export function EventDetailPage() {
  const params = useParams();
  const eventId = Number(params.eventId);
  const query = useEventDetailQuery(eventId, true);
  const event = useMemo(() => (query.data ? toEventCardModel(query.data) : null), [query.data]);
  const unauthorized = query.error && "status" in query.error && query.error.status === 401;

  useStickyPageAction(
    event ? (
      <Link to={`/events/${event.id}/sessions`} className="block">
        <Button fullWidth>회차 선택하기</Button>
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
    return <AppErrorState description="공연 상세를 불러오지 못했습니다." onRetry={() => query.refetch()} />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <PosterImage className="max-w-sm" title={event.title} imageUrl={event.posterUrl} />
      <section className="rounded-card border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge label={event.statusLabel} tone={event.statusTone} />
          <span className="text-sm text-muted-foreground">{event.locationLabel}</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-foreground">{event.title}</h1>
        <div className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <p>공연장: {event.venue}</p>
          <p>기간: {formatDateRange(event.openDate, event.endDate)}</p>
        </div>
        <div className="mt-6 rounded-card bg-muted px-4 py-4 text-sm leading-7 text-muted-foreground">
          {event.description || "소개 텍스트가 아직 제공되지 않았습니다."}
        </div>
        <div className="mt-6 rounded-card border border-border bg-panel p-4">
          <h2 className="text-sm font-semibold text-foreground">안내</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            포스터, 상세 주소, 회차별 대표 가격은 현재 백엔드 계약이 제한적이라 placeholder 혹은
            회차 상세 기반 정보로 연결됩니다.
          </p>
        </div>
        <div className="mt-6 hidden md:block">
          <Link to={`/events/${event.id}/sessions`}>
            <Button>회차 선택하기</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
