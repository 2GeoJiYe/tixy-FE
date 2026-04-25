import { cn } from "@/shared/lib/cn";

interface SeatPreviewProps {
  compact?: boolean;
  className?: string;
}

const rows = [
  { tone: "bg-violet-200", width: "w-[74%]" },
  { tone: "bg-violet-100", width: "w-[84%]" },
  { tone: "bg-sky-100", width: "w-[94%]" },
  { tone: "bg-emerald-100", width: "w-full" },
];

export function SeatPreview({ compact = false, className }: SeatPreviewProps) {
  return (
    <div className={cn("rounded-card border border-border bg-white p-4", className)}>
      <div className="mx-auto mb-4 flex h-9 w-28 items-center justify-center rounded-button bg-zinc-900 text-xs font-black uppercase text-white">
        Stage
      </div>
      <div className="space-y-2">
        {rows.map((row, rowIndex) => (
          <div key={row.tone} className={cn("mx-auto flex justify-center gap-1.5", row.width)}>
            {Array.from({ length: compact ? 12 : 18 }).map((_, index) => (
              <span
                key={`${rowIndex}-${index}`}
                className={cn(
                  "h-3 w-3 rounded-[3px] border border-white/70",
                  row.tone,
                  rowIndex === 1 && index === 8 ? "bg-primary ring-2 ring-zinc-950" : undefined,
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-4 text-[11px] font-semibold text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <i className="h-2 w-2 rounded-full bg-violet-300" />
          VIP석
        </span>
        <span className="inline-flex items-center gap-1">
          <i className="h-2 w-2 rounded-full bg-sky-200" />
          R석
        </span>
        <span className="inline-flex items-center gap-1">
          <i className="h-2 w-2 rounded-full bg-primary" />
          추천
        </span>
      </div>
    </div>
  );
}
