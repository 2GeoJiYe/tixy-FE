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
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-card border border-border bg-surface p-6 shadow-panel">
        <div className="grid gap-6 md:grid-cols-[160px_minmax(0,1fr)_180px] md:items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-4xl font-black text-zinc-950">
            ✓
          </div>
          <div>
            <p className="text-sm font-black text-violet-600">예매 상세</p>
            <h1 className="mt-2 text-4xl font-black text-foreground">예매가 완료되었습니다!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              입금 확인 후 예매 상태가 반영됩니다.
            </p>
            <p className="mt-4 text-sm font-bold text-zinc-700">
              예매번호 2024-0516-{String(draft.sessionId).padStart(4, "0")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <StatusBadge label="주문 완료" tone="success" />
            <StatusBadge label="입금 확인 전" tone="warning" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-5">
          <div className="rounded-card border border-border bg-surface p-6 shadow-card">
            <h2 className="text-xl font-black text-foreground">모바일 티켓 1 / {order.ticketCount}</h2>
            <div className="mt-5 grid gap-5 rounded-card border border-border p-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="aspect-[2/3] rounded-card bg-[linear-gradient(145deg,#f8f8f8,#d2d2d2)] p-4 text-white">
                <p className="text-3xl font-light leading-none">SUMMER<br />LIVE<br />2024</p>
              </div>
              <div>
                <span className="rounded-full bg-violet-100 px-2 py-1 text-[11px] font-black text-violet-700">단독</span>
                <h3 className="mt-3 text-2xl font-black text-zinc-950">{draft.hold.eventTitle}</h3>
                <p className="mt-3 text-sm font-bold text-zinc-700">{formatDateTime(draft.hold.sessionOpenDatetime)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{draft.hold.seatSectionName} · {draft.hold.seatLabels.join(", ")}</p>
                <div className="mt-6 grid gap-4 rounded-card border border-border p-4 md:grid-cols-[minmax(0,1fr)_140px]">
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">예매자</dt>
                      <dd className="font-black text-zinc-950">티씨 김</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">티켓 타입</dt>
                      <dd className="font-black text-zinc-950">일반</dd>
                    </div>
                  </dl>
                  <div className="grid aspect-square grid-cols-7 gap-1 rounded-card bg-white p-2">
                    {Array.from({ length: 49 }).map((_, index) => (
                      <span key={index} className={(index * 7 + index) % 5 === 0 || index % 7 === 0 ? "bg-zinc-950" : "bg-zinc-100"} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-card border border-border bg-surface p-6 shadow-card">
            <h2 className="text-xl font-black text-foreground">입금 안내</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground">총 결제 금액</dt>
                <dd className="mt-1 text-2xl font-black text-violet-600">
                  {formatCurrency(order.totalPayment)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">입금 지갑 주소</dt>
                <dd className="mt-1 break-all rounded-card bg-zinc-50 px-4 py-3 font-bold text-foreground">
                  {order.depositAddress}
                </dd>
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
            <h2 className="text-xl font-black text-foreground">티켓 관리</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {["티켓 공유", "모바일 티켓 저장", "길찾기", "문의하기"].map((action) => (
                <button key={action} type="button" className="rounded-card border border-border bg-white p-4 text-left text-sm font-black text-zinc-900">
                  {action}
                  <span className="mt-2 block text-xs font-medium text-muted-foreground">바로가기</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-card border border-border bg-surface p-6 shadow-card">
            <h2 className="text-xl font-black text-foreground">이런 공연은 어때요?</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-5">
              {["DAYBREAK FESTIVAL 2024", "WICKED", "IM HERO TOUR 2024", "THE SCRIPT LIVE", "LUCY CONCERT"].map((title) => (
                <div key={title} className="rounded-card border border-border bg-white p-3">
                  <div className="aspect-[1.4/1] rounded-[7px] bg-zinc-100" />
                  <p className="mt-2 line-clamp-1 text-xs font-black text-zinc-900">{title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">06.29 - 06.30</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-card border border-border bg-surface p-5 shadow-card">
            <h3 className="text-lg font-black text-foreground">결제 정보</h3>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">티켓 금액</span>
                <span className="font-bold text-zinc-950">{formatCurrency(order.totalPayment - 2000)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">예매 수수료</span>
                <span className="font-bold text-zinc-950">2,000원</span>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between gap-3">
                  <span className="font-black text-zinc-950">총 결제 금액</span>
                  <span className="text-xl font-black text-violet-600">{formatCurrency(order.totalPayment)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-card border border-border bg-surface p-5 shadow-card">
            <h3 className="text-lg font-black text-foreground">안내사항</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              <li>본 공연은 전석 지정좌석제입니다.</li>
              <li>입장 시 QR코드와 신분증을 확인할 수 있습니다.</li>
              <li>공연 시작 후에는 입장이 제한될 수 있습니다.</li>
            </ul>
          </div>
          <div className="rounded-card border border-violet-200 bg-violet-100 p-5 shadow-card">
            <p className="text-sm font-black text-violet-700">TIXY 멤버십 혜택</p>
            <h3 className="mt-2 text-lg font-black text-zinc-950">포인트 적립 및 다양한 혜택을 확인해 보세요.</h3>
          </div>
        </aside>
      </div>
    </div>
  );
}
