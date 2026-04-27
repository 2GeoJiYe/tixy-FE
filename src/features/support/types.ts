import type { SliceResponse } from "@/shared/api/types";

export type SupportRoomStatus = "OPEN" | "SOLVED" | "CLOSED";
export type SupportSenderType = "USER" | "COUNSELOR" | "AI" | "SYSTEM";
export type SupportMessageType = "TEXT" | "SYSTEM";
export type RoomQueueEventType = "CLAIMED" | "RELEASED" | "REQUESTED" | "SOLVED" | "CLOSED";

export interface CreateRoomResponse {
  roomId: number;
  created: boolean;
}

export interface RequestCounselorResponse {
  roomId: number;
  status: SupportRoomStatus;
  counselorUserId: number | null;
  customerRequestedCounselorAt: string | null;
  requested: boolean;
  reopened: boolean;
  alreadyRequested: boolean;
  alreadyAssigned: boolean;
}

export interface RoomSummary {
  roomId: number;
  status: SupportRoomStatus;
  lastMessageId: number | null;
  lastMessageAt: string | null;
  createdAt: string;
  customerRequestedCounselorAt: string | null;
  unreadCount: number;
}

export interface RoomDetail {
  roomId: number;
  customerUserId: number;
  counselorUserId: number | null;
  customerRequestedCounselorAt: string | null;
  status: SupportRoomStatus;
  lastMessageId: number | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MessageItem {
  messageId: number;
  senderUserId: number | null;
  senderType: SupportSenderType;
  messageType: SupportMessageType;
  content: string;
  createdAt: string;
}

export interface MessageCursorResponse {
  messages: MessageItem[];
  hasNext: boolean;
  nextCursor: number | null;
}

export interface ReadReceiptEvent {
  roomId: number;
  readerUserId: number;
  readerRole: string;
  lastReadMessageId: number;
  readAt: string;
}

export interface UnreadCountSyncEvent {
  roomId: number;
  lastReadMessageId: number;
  unreadCount: number;
  readAt: string;
}

export interface MessageEvent extends MessageItem {
  roomId: number;
}

export interface RoomQueueEvent {
  roomId: number;
  eventType: RoomQueueEventType;
  counselorUserId: number | null;
}

export interface SupportListParams {
  page?: number;
  size?: number;
}

export interface AdminRoomActionResponse {
  roomId: number;
  claimed?: boolean;
  released?: boolean;
  solved?: boolean;
  closed?: boolean;
}

export type RoomListResponse = SliceResponse<RoomSummary>;
