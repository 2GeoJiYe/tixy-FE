import { cn } from "@/shared/lib/cn";
import { formatDateTime } from "@/shared/lib/format";
import type { MessageItem } from "@/features/support/types";

interface MessageBubbleProps {
  message: MessageItem;
  isMine: boolean;
  readIndicator?: string;
}

const senderStyle = {
  USER: "bg-primary text-primary-foreground",
  COUNSELOR: "bg-slate-900 text-white",
  AI: "bg-rose-50 text-slate-700 border border-rose-100",
  SYSTEM: "bg-muted text-muted-foreground",
} as const;

const senderLabel = {
  USER: "나",
  COUNSELOR: "상담원",
  AI: "AI",
  SYSTEM: "시스템",
} as const;

export function MessageBubble({ message, isMine, readIndicator }: MessageBubbleProps) {
  return (
    <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
      <div className="max-w-[85%]">
        <p className="mb-1 text-[11px] font-semibold text-muted-foreground">
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
          <span>{formatDateTime(message.createdAt)}</span>
          {readIndicator ? <span className="font-semibold text-primary">{readIndicator}</span> : null}
        </div>
      </div>
    </div>
  );
}
