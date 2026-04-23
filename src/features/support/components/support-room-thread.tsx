import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MessageBubble } from "@/features/support/components/message-bubble";
import { useSupportRealtime } from "@/features/support/realtime/use-support-realtime";
import { useRoomMessagesQuery } from "@/features/support/api/support";
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

  useEffect(() => {
    setLiveMessages([]);
    setLastReadEvent(readStoredReadReceipt(room.roomId));
  }, [room.roomId]);

  const lastReadMessageId = useMemo(() => {
    if (!lastReadEvent || lastReadEvent.readerUserId === currentUserId) {
      return null;
    }

    let candidate: number | null = null;
    allMessages.forEach((message) => {
      if (
        message.senderUserId === currentUserId &&
        message.messageId <= lastReadEvent.lastReadMessageId
      ) {
        candidate = message.messageId;
      }
    });

    return candidate;
  }, [allMessages, currentUserId, lastReadEvent]);

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

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) {
      return;
    }

    const published = sendMessage(room.roomId, content);
    if (!published) {
      showToast("WebSocket 연결이 준비되면 다시 시도해 주세요.", "warning");
      return;
    }

    setDraft("");
  };

  return (
    <div className="flex min-h-[560px] flex-col rounded-card border border-border bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold">문의방 #{room.roomId}</h2>
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
        className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,rgba(248,250,252,0.2),rgba(255,255,255,0.8))] px-5 py-5"
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
            readIndicator={lastReadMessageId === message.messageId ? "읽음" : undefined}
          />
        ))}
      </div>

      <form onSubmit={onSubmit} className="border-t border-border px-5 py-4">
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
          className="min-h-24 resize-none"
        />
        <div className="mt-3 flex justify-end">
          <Button
            type="submit"
            disabled={readOnly || room.status === "CLOSED" || status !== "connected"}
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
