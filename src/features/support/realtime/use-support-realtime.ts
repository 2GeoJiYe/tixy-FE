import { useCallback, useEffect, useRef, useState } from "react";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { useAuth } from "@/app/providers/auth-provider";
import { env } from "@/shared/config/env";
import type {
  MessageEvent,
  ReadReceiptEvent,
  RoomQueueEvent,
  UnreadCountSyncEvent,
} from "@/features/support/types";

type ConnectionStatus = "offline" | "connecting" | "connected";

interface UseSupportRealtimeOptions {
  roomId?: number;
  subscribeQueue?: boolean;
  onMessage?: (event: MessageEvent) => void;
  onReadReceipt?: (event: ReadReceiptEvent) => void;
  onUnreadSync?: (event: UnreadCountSyncEvent) => void;
  onQueueEvent?: (event: RoomQueueEvent) => void;
  enabled?: boolean;
}

function resolveWsUrl(value: string) {
  if (value.startsWith("ws://") || value.startsWith("wss://")) {
    return value;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}${value.startsWith("/") ? value : `/${value}`}`;
}

function parseMessage<T>(message: IMessage) {
  return JSON.parse(message.body) as T;
}

export function useSupportRealtime({
  roomId,
  subscribeQueue = false,
  onMessage,
  onReadReceipt,
  onUnreadSync,
  onQueueEvent,
  enabled = true,
}: UseSupportRealtimeOptions) {
  const { accessToken } = useAuth();
  const callbacksRef = useRef({
    onMessage,
    onReadReceipt,
    onUnreadSync,
    onQueueEvent,
  });
  const clientRef = useRef<Client | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("offline");

  useEffect(() => {
    callbacksRef.current = {
      onMessage,
      onReadReceipt,
      onUnreadSync,
      onQueueEvent,
    };
  }, [onMessage, onQueueEvent, onReadReceipt, onUnreadSync]);

  useEffect(() => {
    if (!enabled || !accessToken) {
      setStatus("offline");
      return;
    }

    const subscriptions: StompSubscription[] = [];
    const client = new Client({
      webSocketFactory: () => new WebSocket(resolveWsUrl(env.supportWsUrl)),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 20_000,
      heartbeatOutgoing: 20_000,
      onConnect: () => {
        setStatus("connected");
        if (roomId) {
          subscriptions.push(
            client.subscribe(`/sub/support/v1/rooms/${roomId}`, (message) => {
              callbacksRef.current.onMessage?.(parseMessage<MessageEvent>(message));
            }),
          );
          subscriptions.push(
            client.subscribe(`/sub/support/v1/rooms/${roomId}/read`, (message) => {
              callbacksRef.current.onReadReceipt?.(parseMessage<ReadReceiptEvent>(message));
            }),
          );
        }

        subscriptions.push(
          client.subscribe(`/user/queue/support/v1/read`, (message) => {
            callbacksRef.current.onUnreadSync?.(parseMessage<UnreadCountSyncEvent>(message));
          }),
        );

        if (subscribeQueue) {
          subscriptions.push(
            client.subscribe(`/sub/support/v1/queue`, (message) => {
              callbacksRef.current.onQueueEvent?.(parseMessage<RoomQueueEvent>(message));
            }),
          );
        }
      },
      onWebSocketClose: () => {
        setStatus("offline");
      },
      onStompError: () => {
        setStatus("offline");
      },
    });

    clientRef.current = client;
    setStatus("connecting");
    client.activate();

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
      client.deactivate();
      clientRef.current = null;
      setStatus("offline");
    };
  }, [accessToken, enabled, roomId, subscribeQueue]);

  const sendMessage = useCallback((targetRoomId: number, content: string) => {
    const client = clientRef.current;
    if (!client || !client.connected) {
      return false;
    }

    try {
      client.publish({
        destination: `/pub/support/v1/rooms/${targetRoomId}/messages`,
        body: JSON.stringify({ content }),
      });
      return true;
    } catch (error) {
      console.warn("failed to publish support message", error);
      return false;
    }
  }, []);

  const markAsRead = useCallback((targetRoomId: number, lastReadMessageId: number) => {
    const client = clientRef.current;
    if (!client || !client.connected) {
      return false;
    }

    try {
      client.publish({
        destination: `/pub/support/v1/rooms/${targetRoomId}/read`,
        body: JSON.stringify({ lastReadMessageId }),
      });
      return true;
    } catch (error) {
      console.warn("failed to publish read receipt", error);
      return false;
    }
  }, []);

  return {
    status,
    sendMessage,
    markAsRead,
  };
}
