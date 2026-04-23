import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCreateOrderMutation } from "@/features/booking/api/booking";
import { readBookingDraft, writeBookingDraft } from "@/features/booking/store/booking-draft";
import { getErrorMessage } from "@/shared/api/error";
import { useCountdown } from "@/shared/hooks/use-countdown";
import { useStickyPageAction } from "@/shared/hooks/use-sticky-page-action";
import { AppErrorState } from "@/shared/ui/app-error-state";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { formatCountdown } from "@/shared/lib/format";
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
              showToast("주문 생성이 완료되었습니다. 입금 대기 화면으로 이동합니다.", "success");
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
        title="먼저 좌석을 홀드해 주세요."
        description="체크아웃은 좌석 홀드 성공 이후에만 진행할 수 있습니다."
        action={
          <Link to="/">
            <Button>홈으로 돌아가기</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-5">
        <div className="rounded-card border border-border bg-surface p-6 shadow-card">
          <h1 className="text-3xl font-bold">체크아웃</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            현재 계약상 주문 생성 전에는 좌석 홀드 상태만 확인할 수 있고, 결제 완료 여부는 웹훅
            처리 이후에만 반영됩니다.
          </p>
        </div>

        <div className="rounded-card border border-border bg-surface p-6 shadow-card">
          <h2 className="text-lg font-semibold">홀드 좌석</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {draft.hold.seatSectionName} · {draft.hold.seatLabels.join(", ")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            남은 홀드 시간 {formatCountdown(countdown.remaining)}
          </p>
        </div>

        <div className="rounded-card border border-border bg-surface p-6 shadow-card">
          <h2 className="text-lg font-semibold">운영형 제약 안내</h2>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <p>정확한 결제 총액은 주문 생성 응답에서만 확정됩니다.</p>
            <p>회원 지갑 주소 보유 여부를 사전 조회하는 API가 없어, 주문 시점 오류로만 감지됩니다.</p>
            <p>결제 만료 시각/상태 조회 API가 없어 대기 화면은 안내형으로만 제공합니다.</p>
          </div>
        </div>

        {walletBlocked ? (
          <AppErrorState
            title="지갑 주소 등록 API가 필요합니다."
            description="현재 백엔드에서는 주문 생성 시 지갑 주소가 없으면 차단하지만, 프론트에서 이를 사전에 조회하거나 등록할 API는 제공하지 않습니다. 운영에서는 회원 정보 API 계약이 추가되어야 합니다."
          />
        ) : null}
      </section>

      <aside className="space-y-4">
        <div className="rounded-card border border-border bg-surface p-5 shadow-card">
          <h3 className="text-sm font-semibold">진행 상태</h3>
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
