import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useEventsQuery } from "@/features/events/api/events";
import { FilterChipGroup } from "@/features/events/components/filter-chip-group";
import { FilterPanel } from "@/features/events/components/filter-panel";
import { SearchBar } from "@/features/events/components/search-bar";
import { SearchResultHeader } from "@/features/events/components/search-result-header";
import { categoryOptions, eventSortOptions, locationOptions } from "@/features/events/constants";
import type { EventSearchFilters } from "@/features/events/types";
import { sortEvents, toEventCardModel } from "@/features/events/utils";
import { AppErrorState } from "@/shared/ui/app-error-state";
import { AuthRequiredNotice } from "@/shared/ui/auth-required-notice";
import { EmptyState } from "@/shared/ui/empty-state";
import { EventCard } from "@/shared/ui/event-card";
import { Button } from "@/shared/ui/button";

function readFilters(searchParams: URLSearchParams): EventSearchFilters {
  const readArray = (key: string) => searchParams.getAll(key);
  return {
    keyword: searchParams.get("q") ?? undefined,
    reservePossible:
      searchParams.get("reservePossible") == null
        ? undefined
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

function writeFilters(filters: EventSearchFilters, sort: string) {
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

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const sort = searchParams.get("sort") ?? "recommended";
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
  const [draftFilters, setDraftFilters] = useState(filters);
  const [draftSort, setDraftSort] = useState(sort);
  const query = useEventsQuery(filters, true);

  useEffect(() => {
    setDraftFilters(filters);
    setDraftSort(sort);
  }, [filters, sort]);

  const sortedItems = useMemo(
    () => sortEvents(query.data ?? [], sort).map((event) => toEventCardModel(event)),
    [query.data, sort],
  );

  const chips = useMemo(() => {
    const result: Array<{ label: string; onRemove: () => void }> = [];

    if (filters.keyword) {
      result.push({
        label: `검색어: ${filters.keyword}`,
        onRemove: () => {
          const next = { ...filters, keyword: undefined };
          setSearchParams(writeFilters(next, sort));
        },
      });
    }

    filters.category?.forEach((category) => {
      result.push({
        label:
          categoryOptions.find((option) => option.value === category)?.label ?? category,
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
  }, [filters, searchParams, setSearchParams, sort]);

  const applyFilters = () => {
    setSearchParams(writeFilters(draftFilters, draftSort));
    setFilterDrawerOpen(false);
  };

  const unauthorized = query.error && "status" in query.error && query.error.status === 401;

  return (
    <div className="space-y-6">
      <SearchBar
        defaultValue={filters.keyword}
        onSearch={(keyword) => {
          const next = { ...filters, keyword: keyword || undefined };
          setDraftFilters(next);
          setSearchParams(writeFilters(next, sort));
        }}
      />

      <SearchResultHeader
        title={filters.keyword ? `“${filters.keyword}” 검색` : "전체 공연"}
        resultCount={sortedItems.length}
        sortLabel={eventSortOptions.find((option) => option.value === sort)?.label ?? "추천순"}
      />

      <div className="flex items-center justify-between gap-3 xl:hidden">
        <FilterChipGroup items={chips} onClear={() => setSearchParams(new URLSearchParams())} />
        <Button variant="secondary" onClick={() => setFilterDrawerOpen(true)}>
          필터
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
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
          <div className="hidden xl:block">
            <FilterChipGroup items={chips} onClear={() => setSearchParams(new URLSearchParams())} />
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

          {query.isLoading ? (
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[0.72] animate-pulse rounded-card bg-muted"
                />
              ))}
            </div>
          ) : null}

          {query.isError && !unauthorized ? (
            <AppErrorState description="공연 목록을 가져오지 못했습니다." onRetry={() => query.refetch()} />
          ) : null}

          {!query.isLoading && !query.isError && sortedItems.length === 0 ? (
            <EmptyState
              title="조건에 맞는 공연이 없습니다."
              description="검색어 또는 필터를 조금만 넓혀 보세요. 총 개수 API가 없어 현재 응답 범위 안에서만 결과를 보여주고 있습니다."
            />
          ) : null}

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
            {sortedItems.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
