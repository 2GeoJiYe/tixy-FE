import { cn } from "@/shared/lib/cn";

type BadgeTone = "default" | "success" | "warning" | "danger" | "muted";

const toneClassName: Record<BadgeTone, string> = {
  default: "border-primary/20 bg-primary/10 text-primary",
  success: "border-success/20 bg-success/10 text-success",
  warning: "border-warning/20 bg-warning/10 text-warning",
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
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-tight",
        toneClassName[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
