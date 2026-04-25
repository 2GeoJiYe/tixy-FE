import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEventsQuery, usePopularEventsQuery } from "@/features/events/api/events";
import { getEventAccent, popularSearchTerms, quickNavItems } from "@/features/events/showcase";
import {
  getFeaturedCollections,
  normalizeEventStatus,
  toEventCardModel,
} from "@/features/events/utils";
import { SearchBar } from "@/features/events/components/search-bar";
import { AppErrorState } from "@/shared/ui/app-error-state";
import { AuthRequiredNotice } from "@/shared/ui/auth-required-notice";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { EventCard } from "@/shared/ui/event-card";
import { PosterImage } from "@/shared/ui/poster-image";
import { SectionHeader } from "@/shared/ui/section-header";
import { SeatPreview } from "@/shared/ui/seat-preview";
import { SkeletonCard } from "@/shared/ui/skeleton-card";
import { formatDate, formatDateRange, toLocalDateTimeString } from "@/shared/lib/format";

function EventSection({
  title,
  eyebrow,
  events,
  isLoading,
  emptyTitle,
  compact,
}: {
  title: string;
  eyebrow: string;
  events: ReturnType<typeof toEventCardModel>[];
  isLoading?: boolean;
  emptyTitle: string;
  compact?: boolean;
}) {
  return (
    <section className="space-y-5">
      <SectionHeader eyebrow={eyebrow} title={title} />
      <div className={compact ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
          : events.slice(0, 8).map((event) => <EventCard key={event.id} event={event} size={compact ? "compact" : "default"} />)}
      </div>
      {!isLoading && events.length === 0 ? (
        <EmptyState title={emptyTitle} description="현재 노출할 공연이 없습니다." />
      ) : null}
    </section>
  );
}

function EventCarouselSection({
  title,
  eyebrow,
  events,
  isLoading,
  emptyTitle,
  onViewAll,
}: {
  title: string;
  eyebrow: string;
  events: ReturnType<typeof toEventCardModel>[];
  isLoading?: boolean;
  emptyTitle: string;
  onViewAll?: () => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const canScroll = isLoading || events.length > 1;

  const scrollByPage = (direction: -1 | 1) => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    scroller.scrollBy({
      left: direction * Math.max(scroller.clientWidth * 0.82, 260),
      behavior: "smooth",
    });
  };

  return (
    <section className="space-y-5">
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        action={
          <div className="flex items-center gap-2">
            {onViewAll ? (
              <Button variant="secondary" className="hidden sm:inline-flex" onClick={onViewAll}>
                전체 보기
              </Button>
            ) : null}
            <button
              type="button"
              aria-label={`${title} 이전`}
              disabled={!canScroll}
              onClick={() => scrollByPage(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-lg font-black text-zinc-800 shadow-card transition hover:border-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ←
            </button>
            <button
              type="button"
              aria-label={`${title} 다음`}
              disabled={!canScroll}
              onClick={() => scrollByPage(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-lg font-black text-zinc-800 shadow-card transition hover:border-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              →
            </button>
          </div>
        }
      />

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="min-w-[210px] snap-start sm:min-w-[230px] lg:min-w-[240px]">
                <SkeletonCard />
              </div>
            ))
          : events.slice(0, 12).map((event) => (
              <div key={event.id} className="min-w-[210px] snap-start sm:min-w-[230px] lg:min-w-[240px]">
                <EventCard event={event} size="compact" />
              </div>
            ))}
      </div>

      {!isLoading && events.length === 0 ? (
        <EmptyState title={emptyTitle} description="현재 노출할 공연이 없습니다." />
      ) : null}
    </section>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const nowText = useMemo(() => toLocalDateTimeString(new Date()), []);
  const popularQuery = usePopularEventsQuery(undefined, true);
  const availableEventsQuery = useEventsQuery({ reservePossible: true, size: 60 }, true);
  const upcomingEventsQuery = useEventsQuery({ startDate: nowText, size: 40 }, true);

  const popularCards = useMemo(
    () =>
      popularQuery.data
        ?.filter((item) => normalizeEventStatus(item.eventInfo.eventStatus) !== "CLOSED")
        .map((item) => toEventCardModel(item.eventInfo, item.referenceCategory)) ?? [],
    [popularQuery.data],
  );

  const homeEventPool = useMemo(() => {
    const merged = [...(availableEventsQuery.data ?? []), ...(upcomingEventsQuery.data ?? [])];
    const deduped = new Map<number, (typeof merged)[number]>();

    merged.forEach((event) => {
      deduped.set(event.id, event);
    });

    return Array.from(deduped.values());
  }, [availableEventsQuery.data, upcomingEventsQuery.data]);

  const collections = useMemo(() => getFeaturedCollections(homeEventPool), [homeEventPool]);
  const onSaleCards = useMemo(
    () => collections.onSale.map((event) => toEventCardModel(event)),
    [collections.onSale],
  );
  const openingTodayCards = useMemo(
    () => collections.openingToday.map((event) => toEventCardModel(event)),
    [collections.openingToday],
  );
  const closingSoonCards = useMemo(
    () => collections.closingSoon.map((event) => toEventCardModel(event)),
    [collections.closingSoon],
  );
  const upcomingCards = useMemo(
    () => collections.upcoming.map((event) => toEventCardModel(event)),
    [collections.upcoming],
  );
  const popularFallbackCards = useMemo(() => {
    if (popularCards.length > 0) {
      return popularCards;
    }

    if (onSaleCards.length > 0) {
      return onSaleCards;
    }

    return upcomingCards;
  }, [onSaleCards, popularCards, upcomingCards]);
  const popularSectionTitle = popularCards.length > 0 ? "인기 공연" : "추천 공연";
  const heroEvent = popularFallbackCards[0] ?? onSaleCards[0] ?? upcomingCards[0];
  const heroSideEvents = popularFallbackCards.slice(1, 4);
  const rankingEvents = popularFallbackCards.slice(0, 5);
  const pickEvent = popularFallbackCards[1] ?? heroEvent;
  const scheduleEvents = homeEventPool.slice(0, 5);
  const [popularKeywordIndex, setPopularKeywordIndex] = useState(0);
  const currentPopularKeyword = popularSearchTerms[popularKeywordIndex % popularSearchTerms.length];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPopularKeywordIndex((current) => (current + 1) % popularSearchTerms.length);
    }, 2400);

    return () => window.clearInterval(timer);
  }, []);

  const anyUnauthorized =
    (popularQuery.error && "status" in popularQuery.error && popularQuery.error.status === 401) ||
    (availableEventsQuery.error &&
      "status" in availableEventsQuery.error &&
      availableEventsQuery.error.status === 401) ||
    (upcomingEventsQuery.error &&
      "status" in upcomingEventsQuery.error &&
      upcomingEventsQuery.error.status === 401);

  const homeListError = availableEventsQuery.isError || upcomingEventsQuery.isError;

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-card border border-border bg-surface shadow-panel">
        <div className="grid gap-6 p-5 md:p-7 xl:grid-cols-[1.08fr_0.82fr_0.7fr] xl:items-stretch">
          <div className="flex min-h-[280px] flex-col justify-between">
            <div>
              <p className="text-sm font-black text-violet-600">단독 선예매 OPEN</p>
              <h1 className="mt-5 max-w-xl break-keep text-4xl font-black leading-tight text-zinc-950 md:text-5xl">
                다가오는 공연,
                <br />
                우리의 라이브
              </h1>
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                TIXY에서 예매 가능한 공연과 좌석을 한눈에 확인하세요.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <SearchBar onSearch={(keyword) => navigate(`/search?q=${encodeURIComponent(keyword)}`)} />
              <div className="flex min-w-0 items-center gap-2 text-xs font-bold text-zinc-700">
                <span className="shrink-0 rounded-full bg-zinc-950 px-3 py-1.5 text-white">인기검색어</span>
                <button
                  key={currentPopularKeyword}
                  type="button"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(currentPopularKeyword)}`)}
                  className="grid min-w-0 grid-cols-[24px_minmax(0,1fr)] items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-left transition hover:border-zinc-300"
                >
                  <span className="font-black text-violet-600">{popularKeywordIndex + 1}</span>
                  <span className="truncate">{currentPopularKeyword}</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-bold text-zinc-600">
                <span className="rounded-full border border-border bg-white px-3 py-2">
                  {heroEvent ? formatDateRange(heroEvent.openDate, heroEvent.endDate) : "일정 준비 중"}
                </span>
                <span className="rounded-full border border-border bg-white px-3 py-2">
                  {heroEvent?.venue ?? "TIXY PICK"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to="/search?reservePossible=true">
                  <Button className="min-w-40">티켓 예매하기 →</Button>
                </Link>
                <Link
                  to="/mypage"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-white px-5 text-sm font-bold text-zinc-700"
                >
                  마이티켓
                </Link>
              </div>
            </div>
          </div>

          <div className="relative min-h-[280px]">
            <div className="absolute left-0 top-10 hidden h-28 w-28 rounded-full bg-violet-200/80 md:block" />
            <PosterImage
              title={heroEvent?.title ?? "SUMMER LIVE 2024"}
              imageUrl={heroEvent?.posterUrl}
              className="mx-auto aspect-[1.05/1] h-full max-h-[300px] w-full max-w-[360px] rounded-[18px]"
            />
            <div className="absolute bottom-4 right-4 rounded-full bg-zinc-950 px-3 py-1 text-xs font-bold text-white">
              1 / {Math.max(popularFallbackCards.length, 1)}
            </div>
          </div>

          <div className="grid gap-3">
            {(heroSideEvents.length ? heroSideEvents : popularFallbackCards.slice(0, 3)).map((event) => {
              const accent = getEventAccent(event.id);

              return (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="grid grid-cols-[88px_minmax(0,1fr)_32px] items-center gap-3 rounded-card border border-border bg-white p-2 transition hover:border-zinc-300"
                >
                  <PosterImage title={event.title} imageUrl={event.posterUrl} className="aspect-[1.25/1] rounded-[7px]" />
                  <div className="min-w-0">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${accent.color}`}>
                      {accent.badge}
                    </span>
                    <p className="mt-2 line-clamp-1 text-sm font-black text-zinc-950">{event.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDateRange(event.openDate, event.endDate)}</p>
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-700">→</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {anyUnauthorized ? (
        <AuthRequiredNotice />
      ) : (
        <>
          <EventCarouselSection
            eyebrow="Trending"
            title={popularSectionTitle}
            events={popularFallbackCards}
            isLoading={popularQuery.isLoading}
            emptyTitle="추천할 공연이 없습니다."
            onViewAll={() => navigate("/search")}
          />

          {popularQuery.isError && !anyUnauthorized ? (
            <AppErrorState description="인기 공연을 불러오지 못했습니다." />
          ) : null}

          <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            {quickNavItems.slice(1).map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="flex min-h-20 items-center justify-center rounded-card border border-border bg-white px-3 text-center text-sm font-black text-zinc-800 shadow-card transition hover:-translate-y-0.5 hover:border-zinc-300"
              >
                <span className="max-w-full truncate whitespace-nowrap">{item.label}</span>
              </Link>
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_1fr_1.2fr]">
            <div className="rounded-card border border-border bg-white p-5 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-zinc-950">실시간 인기 랭킹</h2>
                <Link to="/search?sort=status" className="text-xs font-bold text-muted-foreground">
                  더보기 →
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {rankingEvents.map((event, index) => (
                  <Link key={event.id} to={`/events/${event.id}`} className="grid grid-cols-[24px_40px_minmax(0,1fr)_auto] items-center gap-3">
                    <span className="text-sm font-black text-zinc-950">{String(index + 1).padStart(2, "0")}</span>
                    <PosterImage title={event.title} imageUrl={event.posterUrl} className="aspect-square rounded-[6px]" />
                    <span className="line-clamp-1 text-sm font-bold text-zinc-800">{event.title}</span>
                    <span className="text-xs font-black text-danger">+{(index + 1) * 3}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-card border border-border bg-white p-5 shadow-card">
              <h2 className="text-lg font-black text-zinc-950">오늘의 픽</h2>
              {pickEvent ? (
                <Link to={`/events/${pickEvent.id}`} className="mt-4 block">
                  <PosterImage title={pickEvent.title} imageUrl={pickEvent.posterUrl} className="aspect-[1.75/1] rounded-[10px]" />
                  <p className="mt-3 text-xs font-black text-violet-600">{pickEvent.tags[0] ?? "TIXY PICK"}</p>
                  <h3 className="mt-1 line-clamp-1 text-base font-black text-zinc-950">{pickEvent.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{formatDateRange(pickEvent.openDate, pickEvent.endDate)}</p>
                </Link>
              ) : null}
            </div>

            <div className="rounded-card border border-border bg-white p-5 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-violet-600">MZ 추천 좌석</p>
                  <h2 className="mt-1 text-lg font-black text-zinc-950">지금 가장 많이 고르는 위치</h2>
                </div>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-black text-zinc-950">LIVE</span>
              </div>
              <SeatPreview compact className="mt-4" />
              {heroEvent ? (
                <p className="mt-3 text-sm font-bold text-zinc-800">{heroEvent.venue}</p>
              ) : null}
            </div>
          </section>

          <EventCarouselSection
            eyebrow="On Sale"
            title="판매 중 공연"
            events={onSaleCards}
            isLoading={availableEventsQuery.isLoading || upcomingEventsQuery.isLoading}
            emptyTitle="판매 중인 공연이 없습니다."
            onViewAll={() => navigate("/search?reservePossible=true")}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <EventSection
              eyebrow="Today"
              title="오늘 오픈"
              events={openingTodayCards}
              isLoading={availableEventsQuery.isLoading || upcomingEventsQuery.isLoading}
              emptyTitle="오늘 오픈하는 공연이 없습니다."
              compact
            />
            <EventSection
              eyebrow="Closing Soon"
              title="곧 마감"
              events={closingSoonCards}
              isLoading={availableEventsQuery.isLoading || upcomingEventsQuery.isLoading}
              emptyTitle="곧 마감되는 공연이 없습니다."
              compact
            />
          </div>

          <section className="space-y-4">
            <SectionHeader eyebrow="Calendar" title="다가오는 일정" description="내 관심 공연을 놓치지 않도록 날짜순으로 확인하세요." />
            <div className="grid gap-4 rounded-card border border-border bg-white p-4 shadow-card md:grid-cols-[260px_minmax(0,1fr)]">
              <div className="rounded-card bg-zinc-50 p-4">
                <p className="text-center text-sm font-black text-zinc-950">2026.04</p>
                <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
                  {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                    <span key={day} className="font-bold">{day}</span>
                  ))}
                  {Array.from({ length: 35 }).map((_, index) => (
                    <span
                      key={index}
                      className={`rounded-full py-1 ${index === 25 ? "bg-primary font-black text-zinc-950" : ""}`}
                    >
                      {((index + 1) % 31) || 31}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {scheduleEvents.map((event) => (
                  <Link key={event.id} to={`/events/${event.id}`} className="rounded-card border border-border bg-white p-4 transition hover:border-zinc-300">
                    <p className="text-sm font-black text-zinc-950">{formatDate(event.openDate)}</p>
                    <p className="mt-3 line-clamp-2 text-sm font-bold text-zinc-800">{event.title}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{event.venue}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <EventCarouselSection
            eyebrow="Upcoming"
            title="오픈 예정"
            events={upcomingCards}
            isLoading={availableEventsQuery.isLoading || upcomingEventsQuery.isLoading}
            emptyTitle="오픈 예정 공연이 없습니다."
            onViewAll={() => navigate("/search")}
          />

          {homeListError && !anyUnauthorized ? (
            <AppErrorState
              description="공연 목록을 불러오지 못했습니다."
              onRetry={() => {
                availableEventsQuery.refetch();
                upcomingEventsQuery.refetch();
              }}
            />
          ) : null}

          <section className="grid gap-4 rounded-card border border-border bg-white p-5 shadow-card md:grid-cols-[170px_minmax(0,1fr)_220px] md:items-center">
            <div className="flex h-24 w-24 rotate-[-8deg] items-center justify-center rounded-full bg-violet-200 text-center text-xl font-black leading-none text-zinc-950">
              TIXY
              <br />
              ONLY
            </div>
            <div>
              <h2 className="text-2xl font-black text-zinc-950">오직 TIXY에서만!</h2>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                단독 선예매, 할인, 좌석 추천 혜택을 한 화면에서 확인하세요.
              </p>
            </div>
            <Link to="/search?reservePossible=true">
              <Button fullWidth>혜택 보러가기 →</Button>
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
