import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCreateOrderMutation } from "@/features/booking/api/booking";
import { readBookingDraft, writeBookingDraft } from "@/features/booking/store/booking-draft";
import { getTicketFeeEstimate } from "@/features/events/showcase";
import { getErrorMessage } from "@/shared/api/error";
import { formatCountdown, formatCurrency, formatDateTime } from "@/shared/lib/format";
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
  const estimatedTicketAmount = (draft?.hold?.seatLabels.length ?? 0) * 80_000;
  const feeEstimate = getTicketFeeEstimate(estimatedTicketAmount);
  const discountAmount = draft?.hold ? 6200 : 0;
  const finalEstimate =
    feeEstimate.ticketAmount + feeEstimate.serviceFee + feeEstimate.deliveryFee - discountAmount;

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
      {mutation.isPending ? "주문 생성 중..." : `${formatCurrency(finalEstimate)} 결제하기`}
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
    <div className="space-y-6">
      <div className="mx-auto grid max-w-5xl grid-cols-5 text-center text-xs font-black text-zinc-500">
        {["01 좌석선택", "02 가격/할인선택", "03 배송선택", "04 결제하기", "05 예매완료"].map((step, index) => (
          <div key={step} className="relative py-4">
            <span className={`relative z-10 inline-flex h-5 w-5 items-center justify-center rounded-full border ${index === 3 ? "border-violet-500 bg-violet-500 text-white" : "border-border bg-white"}`}>
              {index + 1}
            </span>
            <p className={`mt-2 hidden sm:block ${index === 3 ? "text-violet-600" : ""}`}>{step}</p>
            {index < 4 ? <span className="absolute left-1/2 top-6 h-px w-full bg-border" /> : null}
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-5">
        <div className="rounded-card border border-border bg-surface p-6 shadow-card">
          <h1 className="text-3xl font-black text-foreground">주문 정보</h1>
          <div className="mt-5 grid gap-4 rounded-card border border-border bg-white p-4 md:grid-cols-[160px_minmax(0,1fr)_220px]">
            <div className="aspect-[1/1] rounded-card bg-[linear-gradient(145deg,#f8f8f8,#d6d6d6)]" />
            <div>
              <span className="rounded-full bg-violet-100 px-2 py-1 text-[11px] font-black text-violet-700">단독</span>
              <h2 className="mt-3 text-xl font-black text-zinc-950">{draft.hold.eventTitle}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{formatDateTime(draft.hold.sessionOpenDatetime)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{draft.hold.seatSectionName} · {draft.hold.seatLabels.join(", ")}</p>
              <Link to="/" className="mt-4 inline-flex rounded-full border border-border px-4 py-2 text-sm font-bold">
                상세보기 →
              </Link>
            </div>
            <div className="border-t border-border pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
              <p className="text-sm font-bold text-muted-foreground">선택 좌석</p>
              <p className="mt-2 text-sm font-black text-zinc-950">{draft.hold.seatLabels.join("\n")}</p>
              <p className="mt-4 text-sm font-bold text-muted-foreground">티켓수</p>
              <p className="mt-1 text-lg font-black text-zinc-950">{draft.hold.seatLabels.length}매</p>
            </div>
          </div>
        </div>

        <div className="rounded-card border border-border bg-surface p-6 shadow-card">
          <h2 className="text-xl font-black text-foreground">예매자 정보</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-3">
              <input className="h-11 w-full rounded-full border border-border px-4 text-sm outline-none focus:ring-4 focus:ring-primary/30" placeholder="이름을 입력해주세요" />
              <input className="h-11 w-full rounded-full border border-border px-4 text-sm outline-none focus:ring-4 focus:ring-primary/30" placeholder="- 없이 숫자만 입력해주세요" />
              <input className="h-11 w-full rounded-full border border-border px-4 text-sm outline-none focus:ring-4 focus:ring-primary/30" placeholder="example@tixy.com" />
              <label className="inline-flex items-center gap-2 text-sm font-bold text-zinc-700">
                <input type="checkbox" />
                예매자 정보와 동일
              </label>
            </div>
            <div className="rounded-card border border-border p-5">
              <h3 className="font-black text-zinc-950">추가 관람자</h3>
              <p className="mt-2 text-sm text-muted-foreground">관람자가 따로 있다면 입력해 주세요.</p>
              <button className="mt-4 rounded-full border border-border px-4 py-2 text-sm font-bold" type="button">
                + 관람자 추가
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-card border border-border bg-surface p-6 shadow-card">
          <h2 className="text-xl font-black text-foreground">할인 및 혜택</h2>
          <div className="mt-4 divide-y divide-border rounded-card border border-border">
            {[
              ["쿠폰 할인", "보유 쿠폰 2장", "-5,000원"],
              ["포인트 사용", "보유 포인트 12,300P", "-3,000P"],
              ["멤버십 혜택", "TIXY VIP 2% 할인 적용", "-1,200원"],
            ].map(([label, note, amount]) => (
              <div key={label} className="grid gap-2 p-4 text-sm md:grid-cols-[150px_minmax(0,1fr)_120px_auto] md:items-center">
                <span className="font-black text-zinc-950">{label}</span>
                <span className="text-muted-foreground">{note}</span>
                <span className="font-black text-violet-600 md:text-right">{amount}</span>
                <button type="button" className="rounded-full border border-border px-3 py-1.5 text-xs font-bold">
                  선택
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-card border border-border bg-surface p-6 shadow-card">
          <h2 className="text-xl font-black text-foreground">결제 수단 선택</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {["카드결제", "간편결제", "포인트 결제", "무통장입금"].map((method, index) => (
              <button
                key={method}
                type="button"
                className={`rounded-card border p-4 text-left text-sm transition ${index === 0 ? "border-violet-400 bg-violet-50" : "border-border bg-white"}`}
              >
                <span className="block text-lg font-black text-zinc-950">{method}</span>
                <span className="mt-2 block text-xs text-muted-foreground">
                  {index === 0 ? "신용/체크카드" : "TIXY 결제 지원"}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-4 rounded-full bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700">
            안전하고 편리한 결제를 위해 모든 정보는 암호화되어 전송됩니다.
          </p>
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
        <div className="rounded-card border border-border bg-surface p-6 shadow-card xl:sticky xl:top-32">
          <h3 className="text-2xl font-black text-foreground">결제 금액</h3>
          <div className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">티켓 금액</span>
              <span className="font-black text-zinc-950">{formatCurrency(feeEstimate.ticketAmount)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">예매 수수료</span>
              <span className="font-black text-zinc-950">{formatCurrency(feeEstimate.serviceFee)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">배송비</span>
              <span className="font-black text-zinc-950">{formatCurrency(feeEstimate.deliveryFee)}</span>
            </div>
            <div className="flex justify-between gap-4 text-violet-600">
              <span className="font-bold">할인 금액</span>
              <span className="font-black">-{formatCurrency(discountAmount)}</span>
            </div>
            <div className="border-t border-border pt-5">
              <div className="flex items-end justify-between gap-4">
                <span className="text-lg font-black text-zinc-950">최종 결제 금액</span>
                <span className="text-3xl font-black text-violet-600">{formatCurrency(finalEstimate)}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">남은 시간 {formatCountdown(countdown.remaining)}</p>
            </div>
          </div>
          <div className="mt-5 hidden xl:block">{orderAction}</div>
          <div className="mt-5 rounded-card border border-violet-200 bg-violet-50 p-4 text-sm font-bold text-violet-700">
            {formatDateTime(draft.hold.sessionOpenDatetime)}까지 결제를 완료해야 예매가 확정됩니다.
          </div>
        </div>
      </aside>
      </div>
    </div>
  );
}
