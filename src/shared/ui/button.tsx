import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantClassName: Record<ButtonVariant, string> = {
  primary:
    "bg-zinc-950 text-white shadow-[inset_0_-10px_18px_rgba(255,255,255,0.08)] hover:bg-zinc-800 disabled:bg-zinc-300",
  secondary:
    "border border-border bg-surface text-foreground hover:border-zinc-300 hover:bg-zinc-50",
  ghost: "bg-transparent text-foreground hover:bg-zinc-100",
  danger: "bg-danger text-white hover:bg-danger/90 disabled:bg-danger/40",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", fullWidth, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-button px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed",
        variantClassName[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
});
