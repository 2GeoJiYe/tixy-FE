import type { MessageItem } from "@/features/support/types";
import { cn } from "@/shared/lib/cn";
import { formatUtcDateTimeToKorea } from "@/shared/lib/format";

interface MessageBubbleProps {
  message: MessageItem;
  isMine: boolean;
  readState?: "read" | "unread";
}

const senderStyle = {
  USER: "bg-violet-200 text-zinc-950",
  COUNSELOR: "bg-slate-900 text-white",
  AI: "border border-border bg-white text-slate-700",
} as const;

const senderLabel = {
  USER: "나",
  COUNSELOR: "상담원",
  AI: "AI",
} as const;

export function MessageBubble({ message, isMine, readState }: MessageBubbleProps) {
  if (message.senderType === "SYSTEM" || message.messageType === "SYSTEM") {
    return (
      <div className="flex justify-center px-3 py-2">
        <div className="max-w-[88%] text-center">
          <div className="inline-flex rounded-full border border-border bg-zinc-100 px-4 py-2 text-xs font-semibold leading-5 text-zinc-600 shadow-sm">
            {message.content}
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {formatUtcDateTimeToKorea(message.createdAt)}
          </p>
        </div>
      </div>
    );
  }

  const showReadState = isMine && readState;

  return (
    <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
      <div className="max-w-[85%]">
        <p className={cn("mb-1 text-[11px] font-semibold text-muted-foreground", isMine && "text-right")}>
          {senderLabel[message.senderType]}
        </p>
        <div
          className={cn(
            "rounded-[18px] px-4 py-3 text-sm leading-6 shadow-card",
            senderStyle[message.senderType],
          )}
        >
          {message.content}
        </div>
        <div className={cn("mt-1 flex items-center gap-2 text-[11px] text-muted-foreground", isMine && "justify-end")}>
          {showReadState ? (
            <span
              className={cn(
                "font-black",
                readState === "unread"
                  ? "inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-zinc-950"
                  : "text-violet-600",
              )}
            >
              {readState === "unread" ? "1" : "읽음"}
            </span>
          ) : null}
          <span>{formatUtcDateTimeToKorea(message.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
