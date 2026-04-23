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
import { useCountdown } from "@/shared/hooks/use-countdown";
import { useStickyPageAction } from "@/shared/hooks/use-sticky-page-action";
import { Button } from "@/shared/ui/button";
import { AppErrorState } from "@/shared/ui/app-error-state";
import { AuthRequiredNotice } from "@/shared/ui/auth-required-notice";
import { EmptyState } from "@/shared/ui/empty-state";
import { StatusBadge } from "@/shared/ui/status-badge";
import { useToast } from "@/shared/ui/toast";
import { formatCountdown, formatDateTime } from "@/shared/lib/format";

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
      showToast("좌석 홀드 시간이 만료되었습니다. 다시 선택해 주세요.", "warning");
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
              showToast("좌석 홀드가 완료되었습니다. 주문 생성 단계로 이동합니다.", "success");
              navigate("/checkout");
            },
            onError: (error) => {
              showToast(getErrorMessage(error), "danger");
            },
          },
        );
      }}
    >
      {holdMutation.isPending ? "홀드 처리 중..." : "좌석 홀드"}
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
        title="좌석 조회는 현재 로그인 후 가능합니다."
        description="Public-first 라우트는 준비했지만 실제 좌석 조회 API는 인증이 필요합니다. 로그인 후 같은 회차 화면으로 복귀할 수 있습니다."
      />
    );
  }

  if (sessionQuery.isError || seatsQuery.isError || !sessionQuery.data) {
    return <AppErrorState description="좌석 선택 정보를 가져오지 못했습니다." onRetry={() => seatsQuery.refetch()} />;
  }

  if (!groupedSections.length) {
    return (
      <EmptyState
        title="현재 선택 가능한 좌석 데이터가 없습니다."
        description="실제 운영 API는 섹션별 seat id 집합만 제공합니다. 좌석 공급이 준비되지 않았거나 판매 상태가 변경된 경우 비어 있을 수 있습니다."
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
              <h1 className="mt-2 text-2xl font-bold">좌석 선택</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                시작 {formatDateTime(sessionQuery.data.sessionOpenDate)} · 종료{" "}
                {formatDateTime(sessionQuery.data.sessionCloseDate)}
              </p>
            </div>
            <StatusBadge
              label={
                draft?.hold && !countdown.expired
                  ? `홀드 남은 시간 ${formatCountdown(countdown.remaining)}`
                  : "홀드 시간 5분"
              }
              tone={draft?.hold && !countdown.expired ? "warning" : "muted"}
            />
          </div>
        </div>

        <div className="rounded-card border border-border bg-surface p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">운영 모드 좌석 정보</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                실 API는 섹션 id와 seat id 목록만 제공하므로, production path에서는 그 범위 안에서만
                선택 UI를 구성합니다.
              </p>
            </div>
            {env.enableMockSeatMap ? (
              <Button variant="secondary" onClick={() => setDemoMode((current) => !current)}>
                {demoMode ? "운영 모드만 보기" : "데모 시트맵 보기"}
              </Button>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {groupedSections.map((section) => (
              <button
                key={section.sectionId}
                type="button"
                onClick={() => {
                  setSelectedSectionId(section.sectionId);
                  setSelectedSeatIds([]);
                }}
                className={`rounded-card border p-4 text-left transition ${
                  selectedSectionId === section.sectionId
                    ? "border-primary bg-primary/5"
                    : "border-border bg-panel"
                }`}
              >
                <p className="text-sm font-semibold text-foreground">{section.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">선택 가능 {section.count}석</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  가격/구역명 상세 매핑 API는 아직 없어 section id 기준으로 노출합니다.
                </p>
              </button>
            ))}
          </div>

          {activeSection ? (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-foreground">
                {activeSection.label} 좌석 선택
              </h3>
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
                      className={`rounded-full px-3 py-2 text-xs font-semibold ${
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
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
          <div className="space-y-3">
            <div className="rounded-card border border-warning/20 bg-warning/5 px-4 py-3 text-sm text-muted-foreground">
              데모 시트맵은 실제 좌석 도면이 아니라, 현재 seat id 목록을 시각적으로 정돈해 보여주는
              mock/demo 모드입니다.
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
          <h2 className="text-lg font-semibold">선택 요약</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            선택 좌석 {selectedSeatIds.length}석 / 최대 5석
          </p>
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
              <span className="text-sm text-muted-foreground">아직 선택한 좌석이 없습니다.</span>
            )}
          </div>
          <div className="mt-5 rounded-card bg-muted px-4 py-4 text-sm text-muted-foreground">
            실시간 총액 계산 API가 없어, 현재 단계에서는 회차 가격표와 주문 생성 결과를 함께
            안내합니다.
          </div>
          <div className="mt-5 hidden xl:block">{holdAction}</div>
        </div>

        {draft?.hold ? (
          <div className="rounded-card border border-border bg-surface p-5 shadow-card">
            <h3 className="text-sm font-semibold">최근 홀드 정보</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {draft.hold.seatSectionName} · {draft.hold.seatLabels.join(", ")}
            </p>
            <div className="mt-4">
              <Link to="/checkout">
                <Button fullWidth variant="secondary">
                  주문 생성으로 이동
                </Button>
              </Link>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
