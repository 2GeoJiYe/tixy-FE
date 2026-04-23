export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-card border border-border bg-surface p-4 shadow-card">
      <div className="aspect-[2/3] rounded-card bg-muted" />
      <div className="mt-4 h-4 w-2/3 rounded-full bg-muted" />
      <div className="mt-3 h-3 w-1/2 rounded-full bg-muted" />
      <div className="mt-2 h-3 w-3/4 rounded-full bg-muted" />
    </div>
  );
}
