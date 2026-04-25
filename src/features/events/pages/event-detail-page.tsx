import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useEventDetailQuery } from "@/features/events/api/events";
import { getDisplayPrice, getEventMiniStats } from "@/features/events/showcase";
import { isEventBookable, toEventCardModel } from "@/features/events/utils";
import { formatCurrency, formatDateRange } from "@/shared/lib/format";
import { useStickyPageAction } from "@/shared/hooks/use-sticky-page-action";
import { AppErrorState } from "@/shared/ui/app-error-state";
import { AuthRequiredNotice } from "@/shared/ui/auth-required-notice";
import { Button } from "@/shared/ui/button";
import { PosterImage } from "@/shared/ui/poster-image";
import { SeatPreview } from "@/shared/ui/seat-preview";
import { StatusBadge } from "@/shared/ui/status-badge";

export function EventDetailPage() {
  const params = useParams();
  const eventId = Number(params.eventId);
  const query = useEventDetailQuery(eventId, true);
  const event = useMemo(() => (query.data ? toEventCardModel(query.data) : null), [query.data]);
  const unauthorized = query.error && "status" in query.error && query.error.status === 401;

  const bookingHref = event ? `/events/${event.id}/sessions` : "#";
  const bookable = event ? isEventBookable(event.eventStatus) : false;

  useStickyPageAction(
    event && bookable ? (
      <Link to={bookingHref} className="block">
        <Button fullWidth>예매하기</Button>
      </Link>
    ) : event ? (
      <Button fullWidth disabled>예매 종료</Button>
    ) : null,
    Boolean(event),
  );

  if (query.isLoading) {
    return <div className="h-96 animate-pulse rounded-card bg-muted" />;
  }

  if (unauthorized) {
    return <AuthRequiredNotice />;
  }

  if (query.isError || !event) {
    return <AppErrorState description="공연 정보를 불러오지 못했습니다." onRetry={() => query.refetch()} />;
  }

  const summaryItems = [
    { label: "공연장", value: event.venue },
    { label: "지역", value: event.locationLabel },
    { label: "기간", value: formatDateRange(event.openDate, event.endDate) },
    { label: "상태", value: event.statusLabel },
  ];
  const stats = getEventMiniStats(event);
  const basePrice = getDisplayPrice(event.id);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        <div className="xl:sticky xl:top-32 xl:self-start">
          <PosterImage className="mx-auto max-w-sm rounded-[18px]" title={event.title} imageUrl={event.posterUrl} />
        </div>

        <div className="space-y-5">
          <div className="rounded-card border border-border bg-white p-5 shadow-card md:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge label={event.tags[0] ?? "공연"} />
              <StatusBadge label={event.statusLabel} tone={event.statusTone} />
            </div>
            <h1 className="mt-5 text-4xl font-black leading-tight text-zinc-950 md:text-5xl">
              {event.title}
            </h1>
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              새로운 여정의 시작, 우리가 함께할 시간
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-bold text-zinc-700">
              <span className="text-amber-500">★ {stats.rating}</span>
              <span>누적 관심 {stats.viewers}명</span>
              <span>{stats.runtime}</span>
              <span>{stats.age}</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {["콘서트", "라이브", "밴드", "감성"].map((tag) => (
                <span key={tag} className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-bold text-zinc-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {summaryItems.map((item) => (
              <div key={item.label} className="rounded-card border border-border bg-white px-4 py-4 shadow-card">
                <p className="text-xs font-bold text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-sm font-black text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="xl:sticky xl:top-32 xl:self-start">
          <div className="rounded-card border border-border bg-white p-5 shadow-panel">
            <h2 className="text-lg font-black text-zinc-950">예매하기</h2>
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm font-bold text-zinc-800">회차 선택</p>
                <div className="mt-2 flex items-center justify-between rounded-full border border-border px-4 py-3 text-sm font-bold">
                  <span>{formatDateRange(event.openDate, event.endDate)}</span>
                  <span>›</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-800">좌석 등급</p>
                <div className="mt-3 space-y-2 text-sm">
                  {[
                    ["VIP석", basePrice + 66000, "bg-violet-300"],
                    ["R석", basePrice + 33000, "bg-sky-300"],
                    ["S석", basePrice, "bg-primary"],
                  ].map(([grade, price, color]) => (
                    <div key={grade} className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-muted-foreground">
                        <i className={`h-3 w-3 rounded-sm ${color}`} />
                        {grade}
                      </span>
                      <span className="font-bold text-zinc-900">{formatCurrency(Number(price))}</span>
                    </div>
                  ))}
                </div>
              </div>
              {bookable ? (
                <Link to={bookingHref} className="block">
                  <Button fullWidth>예매하기 →</Button>
                </Link>
              ) : (
                <Button fullWidth disabled>예매 종료</Button>
              )}
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="flex gap-8 overflow-x-auto border-b border-border text-sm font-black text-zinc-700">
            {["공연정보", "캐스팅", "좌석안내", "취소규정", "후기"].map((tab, index) => (
              <span key={tab} className={`shrink-0 pb-3 ${index === 0 ? "border-b-2 border-zinc-950 text-zinc-950" : ""}`}>
                {tab}
              </span>
            ))}
          </div>

          <div className="grid gap-5 rounded-card border border-border bg-white p-5 shadow-card lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <h2 className="text-lg font-black text-zinc-950">공연 소개</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                {event.description || "등록된 소개가 없습니다."}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-950">좌석 배치도 미리보기</h2>
              <SeatPreview compact className="mt-4" />
            </div>
          </div>

          <div className="rounded-card border border-border bg-white p-5 shadow-card">
            <h2 className="text-lg font-black text-zinc-950">관람 후기</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-[120px_1fr_1fr]">
              <div className="rounded-card border border-border p-4 text-center">
                <p className="text-4xl font-black text-zinc-950">{stats.rating}</p>
                <p className="mt-2 text-sm text-amber-400">★★★★★</p>
              </div>
              {["라이브 음향이 정말 압도적이에요.", "처음부터 마지막까지 완성도 높은 공연이었어요."].map((review) => (
                <div key={review} className="rounded-card border border-border p-4 text-sm text-muted-foreground">
                  <p className="font-bold text-zinc-900">user_***</p>
                  <p className="mt-3 leading-6">{review}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-card border border-border bg-white p-5 shadow-card">
            <h2 className="text-lg font-black text-zinc-950">자주 묻는 질문</h2>
            <div className="mt-4 divide-y divide-border text-sm">
              {["티켓 배송은 언제 되나요?", "취소/환불 규정이 어떻게 되나요?", "현장 수령이 가능한가요?"].map((question) => (
                <div key={question} className="flex items-center justify-between py-3">
                  <span className="font-bold text-zinc-800">Q. {question}</span>
                  <span>⌄</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-card border border-border bg-white p-5 shadow-card">
            <h2 className="text-base font-black text-zinc-950">선택한 예매 정보</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-bold text-muted-foreground">공연장</dt>
                <dd className="mt-1 font-black text-zinc-950">{event.venue}</dd>
              </div>
              <div>
                <dt className="font-bold text-muted-foreground">티켓 금액</dt>
                <dd className="mt-1 text-xl font-black text-zinc-950">{formatCurrency(basePrice)}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-card border border-violet-200 bg-violet-100 p-5 shadow-card">
            <p className="text-sm font-black text-violet-700">TIXY ONLY</p>
            <h3 className="mt-2 text-lg font-black text-zinc-950">단독 선예매와 할인 혜택까지</h3>
          </div>
        </aside>
      </section>
    </div>
  );
}
