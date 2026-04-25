import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MessageBubble } from "@/features/support/components/message-bubble";
import { useSupportRealtime } from "@/features/support/realtime/use-support-realtime";
import { useRoomMessagesQuery } from "@/features/support/api/support";
import { suggestedSupportQuestions } from "@/features/support/suggested-questions";
import {
  readStoredReadReceipt,
  writeStoredReadReceipt,
} from "@/features/support/store/read-receipt";
import type { MessageEvent, MessageItem, ReadReceiptEvent, RoomDetail } from "@/features/support/types";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/input";
import { useToast } from "@/shared/ui/toast";
import { StatusBadge } from "@/shared/ui/status-badge";

interface SupportRoomThreadProps {
  room: RoomDetail;
  currentUserId: number;
  readOnly?: boolean;
}

export function SupportRoomThread({
  room,
  currentUserId,
  readOnly = false,
}: SupportRoomThreadProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [draft, setDraft] = useState("");
  const [liveMessages, setLiveMessages] = useState<MessageItem[]>([]);
  const [lastReadEvent, setLastReadEvent] = useState<ReadReceiptEvent | null>(() =>
    readStoredReadReceipt(room.roomId),
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  const messagesQuery = useRoomMessagesQuery(room.roomId);
  const baseMessages = useMemo(
    () => messagesQuery.data?.pages.flatMap((page) => page.messages) ?? [],
    [messagesQuery.data],
  );
  const allMessages = useMemo(() => {
    const merged = [...baseMessages, ...liveMessages];
    const unique = new Map<number, MessageItem>();
    merged.forEach((message) => unique.set(message.messageId, message));
    return [...unique.values()].sort((left, right) => left.messageId - right.messageId);
  }, [baseMessages, liveMessages]);

  const { status, sendMessage, markAsRead } = useSupportRealtime({
    roomId: room.roomId,
    enabled: room.status !== "CLOSED" || !readOnly,
    onMessage: (event: MessageEvent) => {
      setLiveMessages((current) => [
        ...current,
        {
          messageId: event.messageId,
          senderUserId: event.senderUserId,
          senderType: event.senderType,
          messageType: event.messageType,
          content: event.content,
          createdAt: event.createdAt,
        },
      ]);
      queryClient.invalidateQueries({ queryKey: ["support", "room", room.roomId] });
      queryClient.invalidateQueries({ queryKey: ["support"] });
    },
    onReadReceipt: (event) => {
      setLastReadEvent(event);
      writeStoredReadReceipt(room.roomId, event);
      queryClient.invalidateQueries({ queryKey: ["support"] });
    },
    onUnreadSync: () => {
      queryClient.invalidateQueries({ queryKey: ["support"] });
    },
  });
  const canSendMessage = !readOnly && room.status !== "CLOSED" && status === "connected";

  useEffect(() => {
    setLiveMessages([]);
    setLastReadEvent(readStoredReadReceipt(room.roomId));
  }, [room.roomId]);

  const peerLastReadMessageId = useMemo(() => {
    if (!lastReadEvent || lastReadEvent.readerUserId === currentUserId) {
      return null;
    }

    return lastReadEvent.lastReadMessageId;
  }, [currentUserId, lastReadEvent]);

  const latestReadOwnMessageId = useMemo(() => {
    if (peerLastReadMessageId == null) {
      return null;
    }

    let candidate: number | null = null;
    allMessages.forEach((message) => {
      if (
        message.senderUserId === currentUserId &&
        message.messageType === "TEXT" &&
        message.messageId <= peerLastReadMessageId
      ) {
        candidate = message.messageId;
      }
    });

    return candidate;
  }, [allMessages, currentUserId, peerLastReadMessageId]);

  const getReadState = (message: MessageItem) => {
    if (
      message.senderUserId !== currentUserId ||
      message.messageType !== "TEXT" ||
      message.senderType === "SYSTEM"
    ) {
      return undefined;
    }

    if (peerLastReadMessageId == null || message.messageId > peerLastReadMessageId) {
      return "unread" as const;
    }

    return message.messageId === latestReadOwnMessageId ? ("read" as const) : undefined;
  };

  useEffect(() => {
    const latest = allMessages[allMessages.length - 1];
    if (!latest || readOnly || room.status === "CLOSED" || status !== "connected") {
      return;
    }

    markAsRead(room.roomId, latest.messageId);
  }, [allMessages, markAsRead, readOnly, room.roomId, room.status, status]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    element.scrollTop = element.scrollHeight;
  }, [allMessages.length, lastReadEvent?.lastReadMessageId, lastReadEvent?.readAt]);

  const publishMessage = (message: string, options?: { clearDraft?: boolean }) => {
    const content = message.trim();
    if (!content) {
      return;
    }

    if (!canSendMessage) {
      showToast("WebSocket 연결이 준비되면 다시 시도해 주세요.", "warning");
      return;
    }

    const published = sendMessage(room.roomId, content);
    if (!published) {
      showToast("WebSocket 연결이 준비되면 다시 시도해 주세요.", "warning");
      return;
    }

    if (options?.clearDraft) {
      setDraft("");
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    publishMessage(draft, { clearDraft: true });
  };

  const onMessageKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  return (
    <div id="support-chat-thread" className="flex h-[calc(100vh-64px)] min-h-[880px] max-h-[1240px] min-w-0 scroll-mt-28 flex-col rounded-card border border-border bg-surface shadow-card">
      <div className="shrink-0 flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-lg font-black">문의방 #{room.roomId}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            실시간 연결 상태 {status === "connected" ? "연결됨" : status === "connecting" ? "연결 중" : "끊김"}
          </p>
        </div>
        <StatusBadge
          label={room.status}
          tone={room.status === "OPEN" ? "success" : room.status === "SOLVED" ? "warning" : "muted"}
        />
      </div>

      <div
        ref={containerRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,rgba(250,250,250,0.7),rgba(255,255,255,1))] px-5 py-5"
      >
        {messagesQuery.hasNextPage ? (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() => messagesQuery.fetchNextPage()}
              disabled={messagesQuery.isFetchingNextPage}
            >
              {messagesQuery.isFetchingNextPage ? "불러오는 중..." : "이전 메시지 더 보기"}
            </Button>
          </div>
        ) : null}

        {allMessages.map((message) => (
          <MessageBubble
            key={message.messageId}
            message={message}
            isMine={message.senderUserId != null && message.senderUserId === currentUserId}
            readState={getReadState(message)}
          />
        ))}
      </div>

      <div className="shrink-0 border-t border-violet-100 bg-violet-50/60 px-5 py-3">
        <div className="flex flex-wrap gap-2 text-xs font-bold text-zinc-700">
          {suggestedSupportQuestions.slice(0, 4).map((item) => (
            <button
              key={item.question}
              type="button"
              disabled={!canSendMessage}
              onClick={() => publishMessage(item.question)}
              className="rounded-full border border-violet-100 bg-white px-3 py-2 transition hover:border-violet-300 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {item.question}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="shrink-0 border-t border-border px-5 py-4">
        <Textarea
          disabled={readOnly || room.status === "CLOSED"}
          placeholder={
            readOnly
              ? "SUPER_ADMIN은 조회 전용입니다."
              : room.status === "CLOSED"
                ? "종료된 문의방은 메시지를 보낼 수 없습니다."
                : "메시지를 입력하세요."
          }
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onMessageKeyDown}
          className="min-h-20 resize-none"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-xs font-bold text-muted-foreground">
            {suggestedSupportQuestions.map((item) => (
              <button
                key={item.category}
                type="button"
                disabled={!canSendMessage}
                onClick={() => publishMessage(item.question)}
                className="rounded-full bg-zinc-50 px-3 py-2 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                title={item.question}
              >
                {item.category}
              </button>
            ))}
          </div>
          <Button
            type="submit"
            disabled={!canSendMessage}
            onClick={() => {
              if (status !== "connected") {
                showToast("WebSocket 연결이 준비되면 다시 시도해 주세요.", "warning");
              }
            }}
          >
            보내기
          </Button>
        </div>
      </form>
    </div>
  );
}
