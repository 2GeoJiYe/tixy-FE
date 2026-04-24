import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCreateOrderMutation } from "@/features/booking/api/booking";
import { readBookingDraft, writeBookingDraft } from "@/features/booking/store/booking-draft";
import { getErrorMessage } from "@/shared/api/error";
import { formatCountdown, formatDateTime } from "@/shared/lib/format";
import { useCountdown } from "@/shared/hooks/use-countdown";
import { useStickyPageAction } from "@/shared/hooks/use-sticky-page-action";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { useToast } from "@/shared/ui/toast";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const mutation = useCreateOrderMutation();
  const [draft, setDraft] = useState(readBookingDraft());
  const [walletBlocked, setWalletBlocked] = useState(false);
  const countdown = useCountdown(draft?.hold?.expiresAt);

  useEffect(() => {
    if (draft?.hold && countdown.expired) {
      writeBookingDraft({
        ...draft,
        hold: undefined,
      });
      setDraft(readBookingDraft());
    }
  }, [countdown.expired, draft]);

  const canOrder = Boolean(draft?.hold && !countdown.expired);

  const orderAction = (
    <Button
      fullWidth
      disabled={!draft?.hold || countdown.expired || mutation.isPending}
      onClick={() => {
        if (!draft?.hold) {
          return;
        }

        setWalletBlocked(false);
        mutation.mutate(
          {
            eventSessionId: draft.sessionId,
            seatIds: draft.selectedSeatIds,
            ticketTypeId: draft.hold.ticketTypeId,
          },
          {
            onSuccess: (response) => {
              const nextDraft = {
                ...draft,
                order: {
                  ...response,
                  createdAt: new Date().toISOString(),
                },
              };
              writeBookingDraft(nextDraft);
              setDraft(nextDraft);
              showToast("주문이 생성되었습니다.", "success");
              navigate("/checkout/waiting-payment");
            },
            onError: (error) => {
              const message = getErrorMessage(error);
              if ("code" in (error as object) && (error as { code?: string }).code === "O001") {
                setWalletBlocked(true);
              }
              showToast(message, "danger");
            },
          },
        );
      }}
    >
      {mutation.isPending ? "주문 생성 중..." : "주문 생성"}
    </Button>
  );

  useStickyPageAction(orderAction, true);

  if (!draft?.hold) {
    return (
      <EmptyState
        title="선택한 좌석이 없습니다."
        description="좌석을 고른 뒤 계속 진행할 수 있습니다."
        action={
          <Link to="/">
            <Button>공연 보기</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-5">
        <div className="rounded-card border border-border bg-surface p-6 shadow-card">
          <p className="text-sm text-muted-foreground">{draft.hold.eventTitle}</p>
          <h1 className="mt-3 text-3xl font-bold text-foreground">주문 확인</h1>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-card border border-border bg-panel px-4 py-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                선택 좌석
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {draft.hold.seatSectionName} · {draft.hold.seatLabels.join(", ")}
              </p>
            </div>
            <div className="rounded-card border border-border bg-panel px-4 py-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                남은 시간
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {formatCountdown(countdown.remaining)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-card border border-border bg-surface p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground">예매 정보</h2>
          <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">회차 시작</dt>
              <dd className="mt-1 font-medium text-foreground">
                {formatDateTime(draft.hold.sessionOpenDatetime)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">회차 종료</dt>
              <dd className="mt-1 font-medium text-foreground">
                {formatDateTime(draft.hold.sessionEndDatetime)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">좌석 수</dt>
              <dd className="mt-1 font-medium text-foreground">
                {draft.hold.seatLabels.length}매
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">결제 금액</dt>
              <dd className="mt-1 font-medium text-foreground">주문 생성 후 확인</dd>
            </div>
          </dl>
        </div>

        {walletBlocked ? (
          <div className="rounded-card border border-danger/20 bg-danger/5 p-5 text-sm">
            <h2 className="text-base font-semibold text-foreground">주문을 진행할 수 없습니다.</h2>
            <p className="mt-2 leading-6 text-muted-foreground">
              회원 정보 확인이 필요합니다. 잠시 후 다시 시도하거나 고객센터로 문의해 주세요.
            </p>
            <div className="mt-4">
              <Link to="/support">
                <Button variant="secondary">문의하기</Button>
              </Link>
            </div>
          </div>
        ) : null}
      </section>

      <aside className="space-y-4">
        <div className="rounded-card border border-border bg-surface p-5 shadow-card">
          <h3 className="text-sm font-semibold text-foreground">진행 상태</h3>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p>1. 좌석 선택 완료</p>
            <p>2. 좌석 홀드 완료</p>
            <p className={canOrder ? "font-semibold text-foreground" : "text-danger"}>
              3. 주문 생성 {canOrder ? "가능" : "불가"}
            </p>
          </div>
          <div className="mt-5 hidden xl:block">{orderAction}</div>
        </div>
      </aside>
    </div>
  );
}
