import { useMemo } from "react";
import { Link } from "react-router-dom";
import { readBookingDraft } from "@/features/booking/store/booking-draft";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { StatusBadge } from "@/shared/ui/status-badge";
import { useToast } from "@/shared/ui/toast";
import { formatCurrency, formatDateTime } from "@/shared/lib/format";

export function WaitingPaymentPage() {
  const { showToast } = useToast();
  const draft = useMemo(() => readBookingDraft(), []);
  const order = draft?.order;

  if (!order || !draft?.hold) {
    return (
      <EmptyState
        title="주문 정보가 없습니다."
        description="주문 생성 후 입금 안내를 확인할 수 있습니다."
        action={
          <Link to="/checkout">
            <Button>체크아웃으로 이동</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-card border border-border bg-surface p-6 shadow-panel">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
              Waiting Payment
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">입금 대기</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              입금 확인 후 예매 상태가 반영됩니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label="주문 완료" tone="success" />
            <StatusBadge label="입금 확인 전" tone="warning" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-5">
          <div className="rounded-card border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-foreground">입금 안내</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground">총 결제 금액</dt>
                <dd className="mt-1 text-2xl font-bold text-foreground">
                  {formatCurrency(order.totalPayment)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">입금 지갑 주소</dt>
                <dd className="mt-1 break-all rounded-card bg-panel px-4 py-3 text-foreground">
                  {order.depositAddress}
                </dd>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">티켓 수량</dt>
                  <dd className="mt-1 font-medium text-foreground">{order.ticketCount}매</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">주문 시각</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {formatDateTime(order.createdAt)}
                  </dd>
                </div>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(order.depositAddress);
                  showToast("입금 지갑 주소를 복사했습니다.", "success");
                }}
              >
                주소 복사
              </Button>
              <Link to="/support">
                <Button variant="secondary">문의하기</Button>
              </Link>
            </div>
          </div>

          <div className="rounded-card border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-foreground">진행 상태</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-card border border-border bg-panel px-4 py-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  1
                </p>
                <p className="mt-2 font-semibold text-foreground">주문 생성</p>
              </div>
              <div className="rounded-card border border-warning/20 bg-warning/5 px-4 py-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-warning">2</p>
                <p className="mt-2 font-semibold text-foreground">입금 확인 중</p>
              </div>
              <div className="rounded-card border border-border bg-panel px-4 py-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  3
                </p>
                <p className="mt-2 font-semibold text-foreground">예매 반영</p>
              </div>
            </div>
          </div>
        </section>

        <aside className="rounded-card border border-border bg-surface p-5 shadow-card">
          <h3 className="text-sm font-semibold text-foreground">주문 좌석</h3>
          <p className="mt-3 text-sm text-muted-foreground">{draft.hold.seatLabels.join(", ")}</p>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">구역</span>
              <span className="font-medium text-foreground">{draft.hold.seatSectionName}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">수량</span>
              <span className="font-medium text-foreground">{draft.hold.seatLabels.length}매</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
