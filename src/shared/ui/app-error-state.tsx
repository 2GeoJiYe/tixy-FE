import { Button } from "@/shared/ui/button";

interface AppErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
}

export function AppErrorState({
  title = "요청을 불러오지 못했습니다.",
  description,
  onRetry,
}: AppErrorStateProps) {
  return (
    <div className="rounded-card border border-danger/20 bg-danger/5 px-5 py-6 text-sm text-foreground">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 leading-6 text-muted-foreground">{description}</p>
      {onRetry ? (
        <div className="mt-4">
          <Button variant="secondary" onClick={onRetry}>
            다시 시도
          </Button>
        </div>
      ) : null}
    </div>
  );
}
