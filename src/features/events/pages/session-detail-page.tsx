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
  const bookingHref = `/events/${eventId}/sessions/${sessionId}/seats`;
  const bookable = saleStatus?.tone !== "muted";

  useStickyPageAction(
    bookable ? (
      <Link to={bookingHref}>
        <Button fullWidth>예매하기</Button>
      </Link>
    ) : (
      <Button fullWidth disabled>
        {saleStatus?.label ?? "예매 불가"}
      </Button>
    ),
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
      <section className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
        <div className="border-b border-border px-5 py-6 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{eventQuery.data.title}</p>
              <h1 className="mt-2 text-4xl font-black text-foreground">
                {sessionQuery.data.eventTitle}
              </h1>
            </div>
            {saleStatus ? <StatusBadge label={saleStatus.label} tone={saleStatus.tone} /> : null}
          </div>
        </div>

        <div className="border-b border-border px-5 py-5 md:px-8">
          <div className="rounded-card border border-border bg-panel p-4 md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-black text-foreground">예매</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  좌석을 선택하고 예매를 진행할 수 있습니다.
                </p>
              </div>
              {bookable ? (
                <Link to={bookingHref} className="w-full md:w-auto">
                  <Button fullWidth>예매하기</Button>
                </Link>
              ) : (
                <Button fullWidth disabled className="w-full md:w-auto">
                  {saleStatus?.label ?? "예매 불가"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 px-5 py-6 md:grid-cols-2 md:px-8">
          <div className="rounded-card border border-border bg-panel p-4">
            <p className="text-sm font-black text-foreground">공연 시간</p>
            <p className="mt-2 text-sm text-muted-foreground">
              시작 {formatDateTime(sessionQuery.data.sessionOpenDate)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              종료 {formatDateTime(sessionQuery.data.sessionCloseDate)}
            </p>
          </div>
          <div className="rounded-card border border-border bg-panel p-4">
            <p className="text-sm font-black text-foreground">판매 일정</p>
            <p className="mt-2 text-sm text-muted-foreground">
              오픈 {formatDateTime(sessionQuery.data.saleOpenDate)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              마감 {formatDateTime(sessionQuery.data.saleCloseDate)}
            </p>
          </div>
        </div>

        <div className="px-5 pb-6 md:px-8">
          <div className="rounded-card border border-border bg-surface p-4">
            <p className="text-sm font-black text-foreground">등급별 가격</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatTicketTypePriceMap(sessionQuery.data) || "가격 정보 준비 중"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
