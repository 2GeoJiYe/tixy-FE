import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useEventsQuery } from "@/features/events/api/events";
import { FilterChipGroup } from "@/features/events/components/filter-chip-group";
import { FilterPanel } from "@/features/events/components/filter-panel";
import { SearchBar } from "@/features/events/components/search-bar";
import { SearchResultHeader } from "@/features/events/components/search-result-header";
import { categoryOptions, eventSortOptions, locationOptions } from "@/features/events/constants";
import { getEventAccent, moodChips } from "@/features/events/showcase";
import type { EventSearchFilters, EventSortValue } from "@/features/events/types";
import {
  normalizeEventSort,
  normalizeEventStatus,
  sortEvents,
  toEventCardModel,
} from "@/features/events/utils";
import { AppErrorState } from "@/shared/ui/app-error-state";
import { AuthRequiredNotice } from "@/shared/ui/auth-required-notice";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { EventCard } from "@/shared/ui/event-card";
import { PosterImage } from "@/shared/ui/poster-image";

function readFilters(searchParams: URLSearchParams): EventSearchFilters {
  const readArray = (key: string) => searchParams.getAll(key);

  return {
    keyword: searchParams.get("q") ?? undefined,
    reservePossible:
      searchParams.get("reservePossible") == null
        ? true
        : searchParams.get("reservePossible") === "true",
    area: readArray("area"),
    category: readArray("category"),
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
    startPrice: searchParams.get("startPrice")
      ? Number(searchParams.get("startPrice"))
      : undefined,
    endPrice: searchParams.get("endPrice") ? Number(searchParams.get("endPrice")) : undefined,
  };
}

function writeFilters(filters: EventSearchFilters, sort: EventSortValue) {
  const params = new URLSearchParams();

  if (filters.keyword) params.set("q", filters.keyword);
  if (filters.reservePossible != null) params.set("reservePossible", String(filters.reservePossible));
  filters.area?.forEach((item) => params.append("area", item));
  filters.category?.forEach((item) => params.append("category", item));
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (filters.startPrice != null) params.set("startPrice", String(filters.startPrice));
  if (filters.endPrice != null) params.set("endPrice", String(filters.endPrice));
  if (sort !== "recommended") params.set("sort", sort);

  return params;
}

function hasAdditionalFilters(filters: EventSearchFilters) {
  return Boolean(
    filters.keyword ||
      filters.area?.length ||
      filters.category?.length ||
      filters.startDate ||
      filters.endDate ||
      filters.startPrice != null ||
      filters.endPrice != null,
  );
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const sort = normalizeEventSort(searchParams.get("sort"));
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
  const [draftFilters, setDraftFilters] = useState(filters);
  const [draftSort, setDraftSort] = useState<EventSortValue>(sort);
  const query = useEventsQuery(filters, true);

  useEffect(() => {
    setDraftFilters(filters);
    setDraftSort(sort);
  }, [filters, sort]);

  const defaultLanding = !hasAdditionalFilters(filters) && filters.reservePossible === true;
  const sortedItems = useMemo(() => {
    const baseItems =
      filters.reservePossible === true
        ? (query.data ?? []).filter((event) => normalizeEventStatus(event.eventStatus) === "OPEN")
        : (query.data ?? []);

    return sortEvents(baseItems, sort).map((event) => toEventCardModel(event));
  }, [filters.reservePossible, query.data, sort]);

  const chips = useMemo(() => {
    const result: Array<{ label: string; onRemove: () => void }> = [];

    if (filters.keyword) {
      result.push({
        label: `검색어 ${filters.keyword}`,
        onRemove: () => {
          const next = { ...filters, keyword: undefined };
          setSearchParams(writeFilters(next, sort));
        },
      });
    }

    if (filters.reservePossible === false) {
      result.push({
        label: "전체 상태",
        onRemove: () => {
          const next = { ...filters, reservePossible: true };
          setSearchParams(writeFilters(next, sort));
        },
      });
    }

    filters.category?.forEach((category) => {
      result.push({
        label: categoryOptions.find((option) => option.value === category)?.label ?? category,
        onRemove: () => {
          const next = {
            ...filters,
            category: filters.category?.filter((item) => item !== category),
          };
          setSearchParams(writeFilters(next, sort));
        },
      });
    });

    filters.area?.forEach((area) => {
      result.push({
        label: locationOptions.find((option) => option.value === area)?.label ?? area,
        onRemove: () => {
          const next = {
            ...filters,
            area: filters.area?.filter((item) => item !== area),
          };
          setSearchParams(writeFilters(next, sort));
        },
      });
    });

    return result;
  }, [filters, setSearchParams, sort]);

  const applyFilters = () => {
    setSearchParams(writeFilters(draftFilters, draftSort));
    setFilterDrawerOpen(false);
  };

  const clearFilters = () => {
    const nextFilters = { reservePossible: true };
    setDraftFilters(nextFilters);
    setDraftSort("recommended");
    setSearchParams(writeFilters(nextFilters, "recommended"));
  };

  const unauthorized = query.error && "status" in query.error && query.error.status === 401;
  const spotlightItems = sortedItems.slice(0, 3);
  const keywordItems = sortedItems.slice(0, 10);

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-border bg-white p-5 shadow-panel md:p-6">
        <div className="grid gap-5 xl:grid-cols-[1fr_1fr] xl:items-end">
          <SearchBar
            defaultValue={filters.keyword}
            onSearch={(keyword) => {
              const next = { ...filters, keyword: keyword || undefined };
              setDraftFilters(next);
              setSearchParams(writeFilters(next, sort));
            }}
          />
          <div className="flex flex-wrap gap-2 xl:justify-end">
            <button
              type="button"
              onClick={() => {
                const next = { ...filters, category: undefined };
                setDraftFilters(next);
                setSearchParams(writeFilters(next, sort));
              }}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-black ${
                !filters.category?.length ? "bg-primary text-zinc-950" : "border border-border bg-white text-zinc-700"
              }`}
            >
              전체
            </button>
            {categoryOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  const next = { ...filters, category: [option.value] };
                  setDraftFilters(next);
                  setSearchParams(writeFilters(next, sort));
                }}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-black ${
                  filters.category?.includes(option.value)
                    ? "bg-primary text-zinc-950"
                    : "border border-border bg-white text-zinc-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[80px_minmax(0,1fr)]">
          <span className="text-sm font-black text-zinc-800">지역</span>
          <div className="flex flex-wrap gap-2">
            {locationOptions.slice(0, 12).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  const selected = filters.area?.includes(option.value);
                  const nextArea = selected
                    ? filters.area?.filter((item) => item !== option.value)
                    : [...(filters.area ?? []), option.value];
                  const next = { ...filters, area: nextArea };
                  setDraftFilters(next);
                  setSearchParams(writeFilters(next, sort));
                }}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${
                  filters.area?.includes(option.value)
                    ? "bg-primary text-zinc-950"
                    : "border border-border bg-white text-zinc-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <select
            className="h-11 rounded-full border border-border bg-white px-4 text-sm font-bold outline-none"
            value={sort}
            onChange={(event) => {
              const nextSort = normalizeEventSort(event.target.value);
              setDraftSort(nextSort);
              setSearchParams(writeFilters(filters, nextSort));
            }}
          >
            {eventSortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <label className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-white px-4 py-2 text-sm font-bold text-zinc-700">
            <input
              type="checkbox"
              checked={filters.reservePossible !== false}
              onChange={(event) => {
                const next = { ...filters, reservePossible: event.target.checked };
                setDraftFilters(next);
                setSearchParams(writeFilters(next, sort));
              }}
            />
            판매중만 보기
          </label>
          <Button variant="secondary" className="xl:hidden" onClick={() => setFilterDrawerOpen(true)}>
            상세 필터
          </Button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[248px_minmax(0,1fr)_176px]">
        <aside className="hidden xl:block">
          <FilterPanel
            filters={draftFilters}
            sort={draftSort}
            onChangeFilters={setDraftFilters}
            onChangeSort={setDraftSort}
          />
          <div className="mt-4">
            <Button fullWidth onClick={applyFilters}>
              적용하기
            </Button>
          </div>
        </aside>

        <section className="space-y-4">
          {spotlightItems.length > 0 ? (
            <div className="rounded-card border border-border bg-white p-4 shadow-card">
              <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                <div className="flex flex-col justify-center p-3">
                  <p className="text-sm font-black text-violet-600">지금 뜨는 공연</p>
                  <h1 className="mt-2 break-keep text-3xl font-black leading-tight text-zinc-950">TIXY 에디터 추천</h1>
                  <p className="mt-3 text-sm text-muted-foreground">핫한 공연을 빠르게 모아봤어요.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {spotlightItems.map((event) => {
                    const accent = getEventAccent(event.id);

                    return (
                      <Link key={event.id} to={`/events/${event.id}`} className="block">
                        <div className="relative">
                          <PosterImage title={event.title} imageUrl={event.posterUrl} className="aspect-[1.55/1] rounded-[10px]" />
                          <span className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-black ${accent.color}`}>
                            {accent.badge}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-1 text-sm font-black text-zinc-900">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.venue}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          <div className="hidden xl:block">
            <FilterChipGroup items={chips} onClear={clearFilters} />
          </div>

          {filterDrawerOpen ? (
            <div className="rounded-card border border-border bg-surface p-4 shadow-panel xl:hidden">
              <FilterPanel
                compact
                filters={draftFilters}
                sort={draftSort}
                onChangeFilters={setDraftFilters}
                onChangeSort={setDraftSort}
                onApply={applyFilters}
              />
              <div className="mt-3">
                <Button variant="ghost" fullWidth onClick={() => setFilterDrawerOpen(false)}>
                  닫기
                </Button>
              </div>
            </div>
          ) : null}

          {unauthorized ? <AuthRequiredNotice /> : null}

          <SearchResultHeader
            title={filters.keyword ? `"${filters.keyword}" 검색` : defaultLanding ? "판매 중 공연" : "공연 검색"}
            resultCount={sortedItems.length}
            sortLabel={eventSortOptions.find((option) => option.value === sort)?.label ?? "추천순"}
          />

          {query.isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="aspect-[0.72] animate-pulse rounded-card bg-muted" />
              ))}
            </div>
          ) : null}

          {query.isError && !unauthorized ? (
            <AppErrorState
              description="공연 목록을 불러오지 못했습니다."
              onRetry={() => query.refetch()}
            />
          ) : null}

          {!query.isLoading && !query.isError && sortedItems.length === 0 ? (
            <EmptyState
              title="조건에 맞는 공연이 없습니다."
              description="다른 검색어나 필터로 다시 찾아보세요."
            />
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sortedItems.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        <aside className="hidden space-y-4 xl:block">
          <div className="rounded-card border border-border bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-zinc-950">지금 많이 찾는 키워드</h2>
              <span className="text-xs text-muted-foreground">더보기</span>
            </div>
            <ol className="mt-4 space-y-3">
              {(keywordItems.length ? keywordItems : sortedItems).slice(0, 10).map((event, index) => (
                <li key={event.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 line-clamp-1 font-bold text-zinc-800">
                    {String(index + 1).padStart(2, "0")} {event.title}
                  </span>
                  <span className="text-xs font-black text-danger">+{(index + 1) * 12}%</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-card border border-violet-200 bg-violet-100 p-4 shadow-card">
            <p className="text-sm font-black text-violet-700">첫 예매라면?</p>
            <h3 className="mt-2 text-lg font-black text-zinc-950">TIXY 가이드 보기</h3>
            <Link to="/support" className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white font-black">
              →
            </Link>
          </div>
          <div className="rounded-card border border-border bg-white p-4 shadow-card">
            <h2 className="text-sm font-black text-zinc-950">분위기 추천</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {moodChips.slice(0, 5).map((mood) => (
                <span key={mood} className="rounded-full border border-border px-2.5 py-1 text-xs font-bold text-muted-foreground">
                  {mood}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
