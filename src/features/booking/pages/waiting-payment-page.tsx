import { useMemo } from "react";
import { Link } from "react-router-dom";
import { readBookingDraft } from "@/features/booking/store/booking-draft";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { formatCurrency, formatDateTime } from "@/shared/lib/format";
import { useToast } from "@/shared/ui/toast";

export function WaitingPaymentPage() {
  const { showToast } = useToast();
  const draft = useMemo(() => readBookingDraft(), []);
  const order = draft?.order;

  if (!order || !draft?.hold) {
    return (
      <EmptyState
        title="결제 대기 정보가 없습니다."
        description="주문 생성 이후에만 입금 안내 화면을 확인할 수 있습니다."
        action={
          <Link to="/checkout">
            <Button>체크아웃으로 이동</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-card border border-border bg-surface p-6 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
          Waiting Payment
        </p>
        <h1 className="mt-3 text-3xl font-bold">입금 대기</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          결제 완료는 사용자 브라우저 폴링이 아니라 블록체인 입금 웹훅 처리 이후에만 반영됩니다.
          현재 프론트는 거짓 성공 화면을 만들지 않고, 안내 중심으로 상태를 제공합니다.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-5">
          <div className="rounded-card border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold">입금 안내</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground">총 결제 금액</dt>
                <dd className="mt-1 text-2xl font-bold text-foreground">
                  {formatCurrency(order.totalPayment)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">입금 지갑 주소</dt>
                <dd className="mt-1 break-all rounded-card bg-muted px-4 py-3 text-foreground">
                  {order.depositAddress}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">티켓 수량</dt>
                <dd className="mt-1 text-foreground">{order.ticketCount}매</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">주문 생성 시각</dt>
                <dd className="mt-1 text-foreground">{formatDateTime(order.createdAt)}</dd>
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

          <div className="rounded-card border border-warning/20 bg-warning/5 p-6 text-sm text-muted-foreground">
            백엔드에 결제 상태 조회 API와 결제 만료 시각 계약이 아직 없어, 이 화면은 입금 안내와
            운영 유의사항만 제공합니다. 실제 반영은 `/api/payments/v1/webhook` 처리 이후입니다.
          </div>
        </section>

        <aside className="rounded-card border border-border bg-surface p-5 shadow-card">
          <h3 className="text-sm font-semibold">현재 주문 좌석</h3>
          <p className="mt-3 text-sm text-muted-foreground">{draft.hold.seatLabels.join(", ")}</p>
          <div className="mt-5 space-y-3 text-sm text-muted-foreground">
            <p>완료 확인 폴링: 미지원</p>
            <p>마이티켓 진입: 미지원</p>
            <p>웹훅 기반 확정: 지원</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
