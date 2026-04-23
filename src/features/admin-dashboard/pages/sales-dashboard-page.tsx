import { useMemo, useState } from "react";
import { useSalesDashboardQuery } from "@/features/admin-dashboard/api/dashboard";
import { SalesTrendChart } from "@/features/admin-dashboard/components/sales-trend-chart";
import type { SalesDashboardFilters } from "@/features/admin-dashboard/types";
import { useEventsQuery } from "@/features/events/api/events";
import { AppErrorState } from "@/shared/ui/app-error-state";
import { Button } from "@/shared/ui/button";
import { formatCount, formatCurrency, toLocalDateTimeString } from "@/shared/lib/format";

function defaultRange() {
  const to = new Date();
  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return {
    from: toLocalDateTimeString(from),
    to: toLocalDateTimeString(to),
  };
}

export function SalesDashboardPage() {
  const range = defaultRange();
  const [filters, setFilters] = useState<SalesDashboardFilters>({
    from: range.from,
    to: range.to,
    granularity: "DAY",
    eventId: undefined,
  });
  const dashboardQuery = useSalesDashboardQuery(filters);
  const eventsQuery = useEventsQuery({ size: 100 }, false);

  const summaryCards = useMemo(
    () =>
      dashboardQuery.data
        ? [
            { label: "판매 티켓", value: formatCount(dashboardQuery.data.summary.soldTicketCount) },
            { label: "결제 금액", value: formatCurrency(dashboardQuery.data.summary.paidAmount) },
            { label: "결제 건수", value: formatCount(dashboardQuery.data.summary.paymentCount) },
            { label: "활성 회차", value: formatCount(dashboardQuery.data.summary.sessionCount) },
          ]
        : [],
    [dashboardQuery.data],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-border bg-surface p-6 shadow-panel">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
              Super Admin
            </p>
            <h1 className="mt-3 text-3xl font-bold">판매 대시보드</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              `/api/dashboard/v1/sales` 단일 응답을 기준으로 KPI, 회차 판매 속도, 기간 추이를
              함께 제공합니다.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">From</span>
              <input
                type="datetime-local"
                className="h-11 w-full rounded-input border border-border bg-surface px-3"
                value={filters.from.slice(0, 16)}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    from: `${event.target.value}:00`,
                  }))
                }
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">To</span>
              <input
                type="datetime-local"
                className="h-11 w-full rounded-input border border-border bg-surface px-3"
                value={filters.to.slice(0, 16)}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    to: `${event.target.value}:00`,
                  }))
                }
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Granularity</span>
              <select
                className="h-11 w-full rounded-input border border-border bg-surface px-3"
                value={filters.granularity}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    granularity: event.target.value as "DAY" | "HOUR",
                  }))
                }
              >
                <option value="DAY">DAY</option>
                <option value="HOUR">HOUR</option>
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Event</span>
              <select
                className="h-11 w-full rounded-input border border-border bg-surface px-3"
                value={filters.eventId ?? ""}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    eventId: event.target.value ? Number(event.target.value) : undefined,
                  }))
                }
              >
                <option value="">전체 공연</option>
                {eventsQuery.data?.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      {dashboardQuery.isLoading ? <div className="h-64 animate-pulse rounded-card bg-muted" /> : null}
      {dashboardQuery.isError ? (
        <AppErrorState description="판매 대시보드를 불러오지 못했습니다." onRetry={() => dashboardQuery.refetch()} />
      ) : null}

      {dashboardQuery.data ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="rounded-card border border-border bg-surface p-5 shadow-card">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-3 text-2xl font-bold text-foreground">{card.value}</p>
              </div>
            ))}
          </section>

          <SalesTrendChart points={dashboardQuery.data.trend} />

          <section className="rounded-card border border-border bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">회차별 판매 속도</h2>
              <Button variant="secondary" onClick={() => dashboardQuery.refetch()}>
                새로고침
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="pb-3 pr-4">공연/회차</th>
                    <th className="pb-3 pr-4">판매량</th>
                    <th className="pb-3 pr-4">10/30/60분</th>
                    <th className="pb-3 pr-4">매출</th>
                    <th className="pb-3 pr-4">잔여석</th>
                    <th className="pb-3">판매율</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardQuery.data.sessions.map((session) => (
                    <tr key={session.sessionId} className="border-t border-border">
                      <td className="py-4 pr-4">
                        <div className="font-semibold text-foreground">{session.eventTitle}</div>
                        <div className="text-xs text-muted-foreground">{session.sessionName}</div>
                      </td>
                      <td className="py-4 pr-4">{formatCount(session.soldTicketCount)}</td>
                      <td className="py-4 pr-4">
                        {session.sold10m}/{session.sold30m}/{session.sold60m}
                      </td>
                      <td className="py-4 pr-4">{formatCurrency(session.paidAmount)}</td>
                      <td className="py-4 pr-4">{formatCount(session.remainingSeatCount)}</td>
                      <td className="py-4">{session.sellThroughRate.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
