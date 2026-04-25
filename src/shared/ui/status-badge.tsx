import { cn } from "@/shared/lib/cn";

type BadgeTone = "default" | "success" | "warning" | "danger" | "muted";

const toneClassName: Record<BadgeTone, string> = {
  default: "border-violet-200 bg-violet-100 text-violet-700",
  success: "border-primary/60 bg-primary text-zinc-950",
  warning: "border-violet-200 bg-violet-100 text-violet-700",
  danger: "border-danger/20 bg-danger/10 text-danger",
  muted: "border-border bg-muted text-muted-foreground",
};

interface StatusBadgeProps {
  label: string;
  tone?: BadgeTone;
  className?: string;
}

export function StatusBadge({ label, tone = "default", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-tight",
        toneClassName[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
