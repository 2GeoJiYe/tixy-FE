interface SearchResultHeaderProps {
  title: string;
  resultCount: number;
  sortLabel: string;
}

export function SearchResultHeader({ title, resultCount, sortLabel }: SearchResultHeaderProps) {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-5 shadow-card md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-medium text-primary/80">{title}</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">공연 검색 결과</h1>
      </div>
      <div className="text-sm text-muted-foreground">
        현재 불러온 결과 {resultCount}건 · {sortLabel}
      </div>
    </div>
  );
}
