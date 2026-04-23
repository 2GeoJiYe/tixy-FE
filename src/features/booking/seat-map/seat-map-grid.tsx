import type { GeneratedSeatBlock } from "@/features/booking/seat-map/generate-seat-layout";
import { cn } from "@/shared/lib/cn";

interface SeatMapGridProps {
  blocks: GeneratedSeatBlock[];
  selectedSeatIds: number[];
  onSelect: (seatId: number) => void;
  maxSeatCount: number;
}

export function SeatMapGrid({
  blocks,
  selectedSeatIds,
  onSelect,
  maxSeatCount,
}: SeatMapGridProps) {
  return (
    <div className="rounded-card border border-border bg-surface p-4 shadow-card">
      <div className="mb-5 rounded-full bg-muted px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Stage
      </div>
      <div className="space-y-6 overflow-x-auto">
        {blocks.map((block) => (
          <div key={block.id}>
            <p className="mb-3 text-sm font-semibold text-foreground">{block.title}</p>
            <div className="space-y-2">
              {block.rows.map((row) => (
                <div key={row.label} className="flex items-center gap-2">
                  <span className="w-5 text-xs font-semibold text-muted-foreground">{row.label}</span>
                  <div className="grid grid-cols-[repeat(22,minmax(0,1fr))] gap-1.5">
                    {row.seats.map((seat, seatIndex) =>
                      seat ? (
                        <button
                          key={`${row.label}-${seatIndex}-${seat.seatId}`}
                          type="button"
                          onClick={() => onSelect(seat.seatId)}
                          disabled={
                            !selectedSeatIds.includes(seat.seatId) &&
                            selectedSeatIds.length >= maxSeatCount
                          }
                          className={cn(
                            "h-6 w-6 rounded-[8px] text-[10px] font-semibold transition",
                            selectedSeatIds.includes(seat.seatId)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-primary/15",
                          )}
                          title={`${seat.zoneLabel} ${seat.label}`}
                        >
                          {seat.label.replace(/[A-Z]/g, "")}
                        </button>
                      ) : (
                        <span key={`${row.label}-${seatIndex}`} className="h-6 w-6" />
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
