import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEventsQuery, usePopularEventsQuery } from "@/features/events/api/events";
import { categoryOptions } from "@/features/events/constants";
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
import { SectionHeader } from "@/shared/ui/section-header";
import { SkeletonCard } from "@/shared/ui/skeleton-card";
import { toLocalDateTimeString } from "@/shared/lib/format";

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
      <div className={compact ? "grid grid-cols-2 gap-4" : "grid grid-cols-2 gap-4 xl:grid-cols-4"}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
          : events.slice(0, 8).map((event) => <EventCard key={event.id} event={event} />)}
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
      <section className="rounded-card border border-border bg-surface px-5 py-6 shadow-panel md:px-8 md:py-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/80">Tixy</p>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground md:text-5xl">
            찾고 싶은 공연을 바로 고르세요
          </h1>
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
              title={popularSectionTitle}
              action={
                <Button variant="secondary" onClick={() => navigate("/search")}>
                  전체 보기
                </Button>
              }
            />

            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {popularQuery.isLoading
                ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
                : popularFallbackCards
                    .slice(0, 4)
                    .map((event) => <EventCard key={event.id} event={event} />)}
            </div>

            {!popularQuery.isLoading && popularFallbackCards.length === 0 ? (
              <EmptyState title="추천할 공연이 없습니다." description="현재 노출할 공연이 없습니다." />
            ) : null}

            {popularQuery.isError && !anyUnauthorized ? (
              <AppErrorState description="인기 공연을 불러오지 못했습니다." />
            ) : null}
          </section>

          <EventSection
            eyebrow="On Sale"
            title="판매 중 공연"
            events={onSaleCards}
            isLoading={availableEventsQuery.isLoading || upcomingEventsQuery.isLoading}
            emptyTitle="판매 중인 공연이 없습니다."
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

          <EventSection
            eyebrow="Upcoming"
            title="오픈 예정"
            events={upcomingCards}
            isLoading={availableEventsQuery.isLoading || upcomingEventsQuery.isLoading}
            emptyTitle="오픈 예정 공연이 없습니다."
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
        </>
      )}
    </div>
  );
}
