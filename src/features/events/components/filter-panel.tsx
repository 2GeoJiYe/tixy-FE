import { categoryOptions, eventSortOptions, locationOptions } from "@/features/events/constants";
import type { EventSearchFilters } from "@/features/events/types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

interface FilterPanelProps {
  filters: EventSearchFilters;
  sort: string;
  onChangeFilters: (next: EventSearchFilters) => void;
  onChangeSort: (value: string) => void;
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
      <section>
        <h3 className="text-sm font-semibold text-foreground">카테고리</h3>
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
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-foreground">지역</h3>
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
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
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
              placeholder="최저"
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
              placeholder="최고"
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
            onChange={(event) => onChangeSort(event.target.value)}
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
