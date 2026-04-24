import { Link, useParams } from "react-router-dom";
import { useEventDetailQuery, useEventSessionsQuery } from "@/features/events/api/events";
import { formatSessionPrice, getEventStatusPresentation } from "@/features/events/utils";
import { formatDateTime } from "@/shared/lib/format";
import { useStickyPageAction } from "@/shared/hooks/use-sticky-page-action";
import { AppErrorState } from "@/shared/ui/app-error-state";
import { AuthRequiredNotice } from "@/shared/ui/auth-required-notice";
import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/shared/ui/status-badge";

export function EventSessionsPage() {
  const params = useParams();
  const eventId = Number(params.eventId);
  const eventQuery = useEventDetailQuery(eventId, true);
  const sessionsQuery = useEventSessionsQuery(eventId, true);
  const firstSession = sessionsQuery.data?.content[0];

  useStickyPageAction(
    firstSession ? (
      <Link to={`/events/${eventId}/sessions/${firstSession.sessionId}`}>
        <Button fullWidth>가장 빠른 회차 보기</Button>
      </Link>
    ) : null,
    Boolean(firstSession),
  );

  if (eventQuery.isLoading || sessionsQuery.isLoading) {
    return <div className="h-80 animate-pulse rounded-card bg-muted" />;
  }

  const unauthorized =
    (eventQuery.error && "status" in eventQuery.error && eventQuery.error.status === 401) ||
    (sessionsQuery.error && "status" in sessionsQuery.error && sessionsQuery.error.status === 401);

  if (unauthorized) {
    return <AuthRequiredNotice />;
  }

  if (eventQuery.isError || sessionsQuery.isError || !eventQuery.data) {
    return <AppErrorState description="회차 정보를 불러오지 못했습니다." onRetry={() => sessionsQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-border bg-surface p-6 shadow-card">
        <p className="text-sm text-muted-foreground">{eventQuery.data.venue}</p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{eventQuery.data.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              총 {sessionsQuery.data?.content.length ?? 0}개 회차
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        {sessionsQuery.data?.content.map((session) => {
          const status = getEventStatusPresentation(session.eventSessionStatus);
          return (
            <Link
              key={session.sessionId}
              to={`/events/${eventId}/sessions/${session.sessionId}`}
              className="rounded-card border border-border bg-surface p-5 shadow-card transition hover:border-primary/20 hover:shadow-panel"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge label={status.label} tone={status.tone} />
                    <span className="text-sm text-muted-foreground">
                      좌석 {session.sessionSeatCount.toLocaleString()}석
                    </span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-foreground">{session.eventTitle}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    시작 {formatDateTime(session.sessionOpenDate)} · 종료{" "}
                    {formatDateTime(session.sessionCloseDate)}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-muted-foreground">가격</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {formatSessionPrice(session)}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
