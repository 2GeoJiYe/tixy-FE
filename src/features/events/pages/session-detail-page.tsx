import { Link, useParams } from "react-router-dom";
import { useEventDetailQuery, useEventSessionDetailQuery } from "@/features/events/api/events";
import { formatTicketTypePriceMap, getSessionSaleStatus } from "@/features/events/utils";
import { formatDateTime } from "@/shared/lib/format";
import { useStickyPageAction } from "@/shared/hooks/use-sticky-page-action";
import { AppErrorState } from "@/shared/ui/app-error-state";
import { AuthRequiredNotice } from "@/shared/ui/auth-required-notice";
import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/shared/ui/status-badge";

export function SessionDetailPage() {
  const params = useParams();
  const eventId = Number(params.eventId);
  const sessionId = Number(params.sessionId);

  const eventQuery = useEventDetailQuery(eventId, true);
  const sessionQuery = useEventSessionDetailQuery(eventId, sessionId);

  const saleStatus = sessionQuery.data ? getSessionSaleStatus(sessionQuery.data) : null;

  useStickyPageAction(
    <Link to={`/events/${eventId}/sessions/${sessionId}/seats`}>
      <Button fullWidth>좌석 선택</Button>
    </Link>,
    Boolean(sessionQuery.data),
  );

  if (eventQuery.isLoading || sessionQuery.isLoading) {
    return <div className="h-80 animate-pulse rounded-card bg-muted" />;
  }

  const unauthorized =
    (eventQuery.error && "status" in eventQuery.error && eventQuery.error.status === 401) ||
    (sessionQuery.error && "status" in sessionQuery.error && sessionQuery.error.status === 401);

  if (unauthorized) {
    return <AuthRequiredNotice />;
  }

  if (eventQuery.isError || sessionQuery.isError || !eventQuery.data || !sessionQuery.data) {
    return <AppErrorState description="회차 정보를 불러오지 못했습니다." onRetry={() => sessionQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-border bg-surface p-6 shadow-card">
        <p className="text-sm text-muted-foreground">{eventQuery.data.title}</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-foreground">{sessionQuery.data.eventTitle}</h1>
          {saleStatus ? <StatusBadge label={saleStatus.label} tone={saleStatus.tone} /> : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-card border border-border bg-panel p-4">
            <p className="text-sm font-semibold text-foreground">공연 시간</p>
            <p className="mt-2 text-sm text-muted-foreground">
              시작 {formatDateTime(sessionQuery.data.sessionOpenDate)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              종료 {formatDateTime(sessionQuery.data.sessionCloseDate)}
            </p>
          </div>
          <div className="rounded-card border border-border bg-panel p-4">
            <p className="text-sm font-semibold text-foreground">판매 일정</p>
            <p className="mt-2 text-sm text-muted-foreground">
              오픈 {formatDateTime(sessionQuery.data.saleOpenDate)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              마감 {formatDateTime(sessionQuery.data.saleCloseDate)}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-card border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-foreground">등급별 가격</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatTicketTypePriceMap(sessionQuery.data) || "가격 정보 준비 중"}
          </p>
        </div>

        <div className="mt-6 hidden md:block">
          <Link to={`/events/${eventId}/sessions/${sessionId}/seats`}>
            <Button>좌석 선택</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
