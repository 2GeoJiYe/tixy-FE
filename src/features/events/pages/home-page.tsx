import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useEventsQuery, usePopularEventsQuery } from "@/features/events/api/events";
import { SearchBar } from "@/features/events/components/search-bar";
import { categoryOptions } from "@/features/events/constants";
import { getFeaturedCollections, toEventCardModel } from "@/features/events/utils";
import { AppErrorState } from "@/shared/ui/app-error-state";
import { AuthRequiredNotice } from "@/shared/ui/auth-required-notice";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { EventCard } from "@/shared/ui/event-card";
import { SectionHeader } from "@/shared/ui/section-header";
import { SkeletonCard } from "@/shared/ui/skeleton-card";

export function HomePage() {
  const navigate = useNavigate();
  const popularQuery = usePopularEventsQuery(undefined, true);
  const latestQuery = useEventsQuery({ size: 8 }, true);

  const popularCards = useMemo(
    () => popularQuery.data?.map((item) => toEventCardModel(item.eventInfo, item.referenceCategory)) ?? [],
    [popularQuery.data],
  );

  const latestCards = useMemo(
    () => latestQuery.data?.map((item) => toEventCardModel(item)) ?? [],
    [latestQuery.data],
  );

  const collections = useMemo(() => getFeaturedCollections(latestQuery.data ?? []), [latestQuery.data]);

  const anyUnauthorized =
    (popularQuery.error && "status" in popularQuery.error && popularQuery.error.status === 401) ||
    (latestQuery.error && "status" in latestQuery.error && latestQuery.error.status === 401);

  return (
    <div className="space-y-10">
      <section className="rounded-card border border-border bg-surface px-5 py-6 shadow-panel md:px-8 md:py-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/80">
            Ticketing Flow
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground md:text-5xl">
            검색부터 문의까지 한 흐름으로 이어지는 Tixy 티켓 플랫폼
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
            과장된 랜딩이 아니라 실제 예매 흐름에 맞춘 탐색 구조로 구성했습니다. 공연 목록,
            회차 선택, 좌석 홀드, 결제 대기, 문의 채팅까지 하나의 앱에서 이어집니다.
          </p>
        </div>
        <div className="mt-6">
          <SearchBar onSearch={(keyword) => navigate(`/search?q=${encodeURIComponent(keyword)}`)} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {categoryOptions.map((category) => (
            <Link
              key={category.value}
              to={`/search?category=${category.value}`}
              className="rounded-full bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
            >
              {category.label}
            </Link>
          ))}
        </div>
      </section>

      {anyUnauthorized ? (
        <AuthRequiredNotice />
      ) : (
        <>
          <section className="space-y-5">
            <SectionHeader
              eyebrow="Popular"
              title="인기 공연"
              description="`/api/v1/events/popular` 응답 기준으로 구성한 큐레이션입니다."
              action={
                <Button variant="secondary" onClick={() => navigate("/search")}>
                  전체 보기
                </Button>
              }
            />
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {popularQuery.isLoading
                ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
                : popularCards.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
            {!popularQuery.isLoading && popularCards.length === 0 ? (
              <EmptyState
                title="인기 공연이 아직 집계되지 않았습니다."
                description="조회수 집계 결과가 없을 때는 인기 섹션이 비어 있을 수 있습니다."
              />
            ) : null}
            {popularQuery.isError && !anyUnauthorized ? (
              <AppErrorState description="인기 공연 데이터를 가져오지 못했습니다." />
            ) : null}
          </section>

          <section className="space-y-5">
            <SectionHeader
              eyebrow="Curated"
              title="오늘 오픈 / 곧 마감"
              description="이벤트 일정 필드를 기준으로 프론트에서 파생한 운영형 큐레이션입니다."
            />
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-card border border-border bg-surface p-5 shadow-card">
                <h3 className="text-lg font-semibold">오늘 오픈</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {collections.openingToday.length > 0 ? (
                    collections.openingToday
                      .slice(0, 2)
                      .map((event) => <EventCard key={event.id} event={toEventCardModel(event)} />)
                  ) : (
                    <EmptyState
                      title="오늘 오픈 공연이 없습니다."
                      description="기준 시각과 이벤트 오픈일이 가까운 공연이 있을 때만 노출됩니다."
                    />
                  )}
                </div>
              </div>
              <div className="rounded-card border border-border bg-surface p-5 shadow-card">
                <h3 className="text-lg font-semibold">곧 마감</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {collections.closingSoon.length > 0 ? (
                    collections.closingSoon
                      .slice(0, 2)
                      .map((event) => <EventCard key={event.id} event={toEventCardModel(event)} />)
                  ) : (
                    <EmptyState
                      title="마감 임박 공연이 없습니다."
                      description="마감일이 가까운 공연이 있을 때만 노출됩니다."
                    />
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeader
              eyebrow="Browse"
              title="전체 공연"
              description="목록 응답은 총 개수 없이 리스트만 반환하므로, 현재 로드된 항목 중심으로 구성했습니다."
            />
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {latestQuery.isLoading
                ? Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)
                : latestCards.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
