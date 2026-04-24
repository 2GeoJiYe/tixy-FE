import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";
import { useActiveSeatsQuery, useSeatHoldMutation } from "@/features/booking/api/booking";
import { generateSeatLayout } from "@/features/booking/seat-map/generate-seat-layout";
import { SeatMapGrid } from "@/features/booking/seat-map/seat-map-grid";
import { readBookingDraft, writeBookingDraft } from "@/features/booking/store/booking-draft";
import { useEventSessionDetailQuery } from "@/features/events/api/events";
import { getErrorMessage } from "@/shared/api/error";
import { env } from "@/shared/config/env";
import { formatCountdown, formatDateTime, formatCurrency } from "@/shared/lib/format";
import { useCountdown } from "@/shared/hooks/use-countdown";
import { useStickyPageAction } from "@/shared/hooks/use-sticky-page-action";
import { AppErrorState } from "@/shared/ui/app-error-state";
import { AuthRequiredNotice } from "@/shared/ui/auth-required-notice";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { StatusBadge } from "@/shared/ui/status-badge";
import { useToast } from "@/shared/ui/toast";

export function SeatSelectionPage() {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const eventId = Number(params.eventId);
  const sessionId = Number(params.sessionId);

  const sessionQuery = useEventSessionDetailQuery(eventId, sessionId);
  const seatsQuery = useActiveSeatsQuery(sessionId);
  const holdMutation = useSeatHoldMutation();

  const [selectedSectionId, setSelectedSectionId] = useState<number | undefined>();
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [demoMode, setDemoMode] = useState(false);
  const [draft, setDraft] = useState(readBookingDraft());

  useEffect(() => {
    if (draft?.sessionId === sessionId) {
      setSelectedSectionId(draft.sectionId);
      setSelectedSeatIds(draft.selectedSeatIds);
    }
  }, [draft, sessionId]);

  const countdown = useCountdown(draft?.hold?.expiresAt);
  useEffect(() => {
    if (draft?.hold && countdown.expired) {
      writeBookingDraft({
        ...draft,
        hold: undefined,
        order: undefined,
      });
      setDraft(readBookingDraft());
      showToast("좌석 홀드 시간이 만료되었습니다.", "warning");
    }
  }, [countdown.expired, draft, showToast]);

  const groupedSections = useMemo(
    () =>
      (seatsQuery.data ?? []).map((item) => ({
        sectionId: item.seatSectionId,
        label: `구역 ${item.seatSectionId}`,
        count: item.seatSessionIds.length,
        seatIds: item.seatSessionIds,
      })),
    [seatsQuery.data],
  );

  useEffect(() => {
    if (!selectedSectionId && groupedSections[0]) {
      setSelectedSectionId(groupedSections[0].sectionId);
    }
  }, [groupedSections, selectedSectionId]);

  const activeSection = groupedSections.find((item) => item.sectionId === selectedSectionId);
  const mockBlocks = useMemo(
    () =>
      activeSection
        ? generateSeatLayout("medium_theater", [
            {
              sectionId: activeSection.sectionId,
              label: activeSection.label,
              seatIds: activeSection.seatIds.slice(0, 120),
            },
          ])
        : [],
    [activeSection],
  );
  const priceEntries = useMemo(
    () =>
      Object.entries(sessionQuery.data?.ticketTypePrice ?? {}).sort((left, right) => left[0].localeCompare(right[0])),
    [sessionQuery.data?.ticketTypePrice],
  );

  const holdAction = (
    <Button
      fullWidth
      disabled={!selectedSectionId || selectedSeatIds.length === 0 || holdMutation.isPending}
      onClick={() => {
        if (!selectedSectionId) {
          return;
        }

        if (!isAuthenticated) {
          navigate("/login", {
            state: {
              redirectTo: `${location.pathname}${location.search}`,
            },
          });
          return;
        }

        holdMutation.mutate(
          {
            eventSessionId: sessionId,
            seatIds: selectedSeatIds,
            seatSectionId: selectedSectionId,
          },
          {
            onSuccess: (response) => {
              const nextDraft = {
                eventId,
                sessionId,
                sectionId: selectedSectionId,
                selectedSeatIds,
                hold: {
                  ...response,
                  heldAt: new Date().toISOString(),
                  expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
                },
              };
              writeBookingDraft(nextDraft);
              setDraft(nextDraft);
              showToast("좌석이 선택되었습니다.", "success");
              navigate("/checkout");
            },
            onError: (error) => {
              showToast(getErrorMessage(error), "danger");
            },
          },
        );
      }}
    >
      {holdMutation.isPending ? "좌석 홀드 중..." : "좌석 홀드"}
    </Button>
  );

  useStickyPageAction(holdAction, true);

  if (sessionQuery.isLoading || seatsQuery.isLoading) {
    return <div className="h-80 animate-pulse rounded-card bg-muted" />;
  }

  const unauthorized =
    (seatsQuery.error && "status" in seatsQuery.error && seatsQuery.error.status === 401) ||
    (sessionQuery.error && "status" in sessionQuery.error && sessionQuery.error.status === 401);

  if (unauthorized) {
    return (
      <AuthRequiredNotice
        title="로그인 후 좌석을 선택할 수 있습니다."
        description="로그인하면 같은 화면으로 돌아옵니다."
      />
    );
  }

  if (sessionQuery.isError || seatsQuery.isError || !sessionQuery.data) {
    return <AppErrorState description="좌석 정보를 불러오지 못했습니다." onRetry={() => seatsQuery.refetch()} />;
  }

  if (!groupedSections.length) {
    return (
      <EmptyState
        title="선택 가능한 좌석이 없습니다."
        description="다른 회차를 확인해 주세요."
        action={
          <Link to={`/events/${eventId}/sessions`}>
            <Button variant="secondary">회차 다시 보기</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-5">
        <div className="rounded-card border border-border bg-surface p-5 shadow-card">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{sessionQuery.data.eventTitle}</p>
              <h1 className="mt-2 text-2xl font-bold text-foreground">좌석 선택</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                시작 {formatDateTime(sessionQuery.data.sessionOpenDate)} · 종료{" "}
                {formatDateTime(sessionQuery.data.sessionCloseDate)}
              </p>
            </div>
            <StatusBadge
              label={
                draft?.hold && !countdown.expired
                  ? `남은 시간 ${formatCountdown(countdown.remaining)}`
                  : "홀드 5분"
              }
              tone={draft?.hold && !countdown.expired ? "warning" : "muted"}
            />
          </div>
        </div>

        <div className="rounded-card border border-border bg-surface p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">구역 선택</h2>
            {env.enableMockSeatMap ? (
              <Button variant="secondary" onClick={() => setDemoMode((current) => !current)}>
                {demoMode ? "좌석 목록" : "도면 보기"}
              </Button>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {groupedSections.map((section) => {
              const selected = selectedSectionId === section.sectionId;

              return (
                <button
                  key={section.sectionId}
                  type="button"
                  onClick={() => {
                    setSelectedSectionId(section.sectionId);
                    setSelectedSeatIds([]);
                  }}
                  className={`rounded-card border p-4 text-left transition ${
                    selected ? "border-primary bg-primary/5 shadow-card" : "border-border bg-panel"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{section.label}</p>
                    {selected ? <StatusBadge label="선택 중" /> : null}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    선택 가능 {section.count.toLocaleString()}석
                  </p>
                </button>
              );
            })}
          </div>

          {activeSection ? (
            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-foreground">{activeSection.label}</h3>
                <span className="text-xs text-muted-foreground">최대 5석</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeSection.seatIds.map((seatId) => {
                  const selected = selectedSeatIds.includes(seatId);

                  return (
                    <button
                      key={seatId}
                      type="button"
                      onClick={() => {
                        setSelectedSeatIds((current) => {
                          if (current.includes(seatId)) {
                            return current.filter((item) => item !== seatId);
                          }

                          if (current.length >= 5) {
                            showToast("최대 5석까지 선택할 수 있습니다.", "warning");
                            return current;
                          }

                          return [...current, seatId];
                        });
                      }}
                      className={`min-w-20 rounded-full px-3 py-2 text-xs font-semibold transition ${
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-panel"
                      }`}
                    >
                      Seat #{seatId}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {demoMode && activeSection ? (
          <div className="rounded-card border border-border bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">도면 보기</h2>
              <StatusBadge label="미리보기" tone="muted" />
            </div>
            <SeatMapGrid
              blocks={mockBlocks}
              selectedSeatIds={selectedSeatIds}
              maxSeatCount={5}
              onSelect={(seatId) => {
                setSelectedSeatIds((current) => {
                  if (current.includes(seatId)) {
                    return current.filter((item) => item !== seatId);
                  }
                  if (current.length >= 5) {
                    return current;
                  }
                  return [...current, seatId];
                });
              }}
            />
          </div>
        ) : null}
      </section>

      <aside className="space-y-4">
        <div className="rounded-card border border-border bg-surface p-5 shadow-card">
          <h2 className="text-lg font-semibold text-foreground">선택 요약</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">구역</span>
              <span className="font-medium text-foreground">{activeSection?.label ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">선택 좌석</span>
              <span className="font-medium text-foreground">{selectedSeatIds.length}석</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedSeatIds.length > 0 ? (
              selectedSeatIds.map((seatId) => (
                <span
                  key={seatId}
                  className="rounded-full bg-muted px-3 py-2 text-xs font-medium text-muted-foreground"
                >
                  Seat #{seatId}
                </span>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">선택한 좌석이 없습니다.</span>
            )}
          </div>

          {priceEntries.length > 0 ? (
            <div className="mt-5 rounded-card bg-panel px-4 py-4">
              <h3 className="text-sm font-semibold text-foreground">가격 안내</h3>
              <div className="mt-3 space-y-2 text-sm">
                {priceEntries.map(([grade, price]) => (
                  <div key={grade} className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">{grade}</span>
                    <span className="font-medium text-foreground">{formatCurrency(price)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5 xl:hidden">{holdAction}</div>
          <div className="mt-5 hidden xl:block">{holdAction}</div>
        </div>

        {draft?.hold ? (
          <div className="rounded-card border border-border bg-surface p-5 shadow-card">
            <h3 className="text-sm font-semibold text-foreground">최근 홀드</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {draft.hold.seatSectionName} · {draft.hold.seatLabels.join(", ")}
            </p>
            <div className="mt-4">
              <Link to="/checkout">
                <Button fullWidth variant="secondary">
                  주문 확인
                </Button>
              </Link>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
