import { Button } from "@/shared/ui/button";

interface FilterChipGroupProps {
  items: Array<{ label: string; onRemove: () => void }>;
  onClear: () => void;
}

export function FilterChipGroup({ items, onClear }: FilterChipGroupProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onRemove}
          className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground"
        >
          {item.label} ×
        </button>
      ))}
      <Button variant="ghost" onClick={onClear} type="button">
        전체 해제
      </Button>
    </div>
  );
}
