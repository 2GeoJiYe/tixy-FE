import { cn } from "@/shared/lib/cn";
import { formatDateTime } from "@/shared/lib/format";
import type { MessageItem } from "@/features/support/types";

interface MessageBubbleProps {
  message: MessageItem;
  isMine: boolean;
  readState?: "read" | "unread";
}

const senderStyle = {
  USER: "bg-violet-200 text-zinc-950",
  COUNSELOR: "bg-slate-900 text-white",
  AI: "bg-white text-slate-700 border border-border",
  SYSTEM: "bg-muted text-muted-foreground",
} as const;

const senderLabel = {
  USER: "나",
  COUNSELOR: "상담원",
  AI: "AI",
  SYSTEM: "시스템",
} as const;

export function MessageBubble({ message, isMine, readState }: MessageBubbleProps) {
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
            message.senderType === "SYSTEM" && "max-w-md rounded-card",
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
          <span>{formatDateTime(message.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
