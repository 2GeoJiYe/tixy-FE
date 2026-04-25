import { categoryOptions, eventSortOptions, locationOptions } from "@/features/events/constants";
import { moodChips } from "@/features/events/showcase";
import type { EventSearchFilters, EventSortValue } from "@/features/events/types";
import { normalizeEventSort } from "@/features/events/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

interface FilterPanelProps {
  filters: EventSearchFilters;
  sort: EventSortValue;
  onChangeFilters: (next: EventSearchFilters) => void;
  onChangeSort: (value: EventSortValue) => void;
  onApply?: () => void;
  compact?: boolean;
}

function toggleArrayItem(items: string[] | undefined, value: string) {
  const current = new Set(items ?? []);
  if (current.has(value)) {
    current.delete(value);
  } else {
    current.add(value);
  }

  return [...current];
}

export function FilterPanel({
  filters,
  sort,
  onChangeFilters,
  onChangeSort,
  onApply,
  compact,
}: FilterPanelProps) {
  return (
    <div className="space-y-5 rounded-card border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-foreground">필터</h2>
          <p className="mt-1 text-xs text-muted-foreground">취향에 맞게 공연을 좁혀보세요</p>
        </div>
        <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-black text-zinc-950">
          TIXY
        </span>
      </div>
      <section>
        <h3 className="text-sm font-bold text-foreground">분위기</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {moodChips.map((mood) => (
            <button
              key={mood}
              type="button"
              className="whitespace-nowrap rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            >
              {mood}
            </button>
          ))}
        </div>
      </section>
      <section>
        <h3 className="text-sm font-bold text-foreground">장르</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {categoryOptions.map((option) => {
            const selected = filters.category?.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  onChangeFilters({
                    ...filters,
                    category: toggleArrayItem(filters.category, option.value),
                  })
                }
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-white text-muted-foreground"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold text-foreground">지역</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {locationOptions.map((option) => {
            const selected = filters.area?.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  onChangeFilters({
                    ...filters,
                    area: toggleArrayItem(filters.area, option.value),
                  })
                }
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-white text-muted-foreground"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3">
        <label className="space-y-2">
          <span className="text-sm font-semibold">예매 가능만 보기</span>
          <select
            className="h-11 w-full rounded-input border border-border bg-surface px-3 text-sm"
            value={filters.reservePossible == null ? "" : String(filters.reservePossible)}
            onChange={(event) =>
              onChangeFilters({
                ...filters,
                reservePossible:
                  event.target.value === "" ? undefined : event.target.value === "true",
              })
            }
          >
            <option value="">전체</option>
            <option value="true">예매 가능</option>
            <option value="false">예매 예정 포함</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold">기간</span>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              value={filters.startDate ?? ""}
              onChange={(event) => onChangeFilters({ ...filters, startDate: event.target.value })}
            />
            <Input
              type="date"
              value={filters.endDate ?? ""}
              onChange={(event) => onChangeFilters({ ...filters, endDate: event.target.value })}
            />
          </div>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold">가격대</span>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              min={0}
              placeholder="최소"
              value={filters.startPrice ?? ""}
              onChange={(event) =>
                onChangeFilters({
                  ...filters,
                  startPrice: event.target.value ? Number(event.target.value) : undefined,
                })
              }
            />
            <Input
              type="number"
              min={0}
              placeholder="최대"
              value={filters.endPrice ?? ""}
              onChange={(event) =>
                onChangeFilters({
                  ...filters,
                  endPrice: event.target.value ? Number(event.target.value) : undefined,
                })
              }
            />
          </div>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold">정렬</span>
          <select
            className="h-11 w-full rounded-input border border-border bg-surface px-3 text-sm"
            value={sort}
            onChange={(event) => onChangeSort(normalizeEventSort(event.target.value))}
          >
            {eventSortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      {compact && onApply ? (
        <Button fullWidth onClick={onApply} type="button">
          필터 적용
        </Button>
      ) : null}
    </div>
  );
}
