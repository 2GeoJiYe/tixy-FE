import type { SpringPage } from "@/shared/api/types";

export interface EventItem {
  id: number;
  title: string;
  description: string;
  location: string;
  venue: string;
  eventStatus: string;
  openDate: string;
  endDate: string;
}

export interface PopularEventItem {
  referenceCategory: string;
  eventInfo: EventItem;
  viewScore: number;
}

export interface EventSearchFilters {
  keyword?: string;
  reservePossible?: boolean;
  area?: string[];
  category?: string[];
  startDate?: string;
  endDate?: string;
  startPrice?: number;
  endPrice?: number;
  page?: number;
  size?: number;
}

export interface EventSessionItem {
  sessionId: number;
  eventTitle: string;
  sessionSeatCount: number;
  eventSessionStatus: string;
  sessionOpenDate: string;
  sessionCloseDate: string;
  minPrice: number;
  maxPrice: number;
}

export interface EventSessionDetail {
  eventTitle: string;
  sessionSeatCount: number;
  eventSessionStatus: string;
  sessionOpenDate: string;
  sessionCloseDate: string;
  saleOpenDate: string;
  saleCloseDate: string;
  ticketTypePrice: Record<string, number>;
}

export interface EventCardModel extends EventItem {
  posterUrl?: string | null;
  locationLabel: string;
  statusLabel: string;
  statusTone: "default" | "success" | "warning" | "danger" | "muted";
  priceLabel?: string;
  tags: string[];
}

export type EventSessionPage = SpringPage<EventSessionItem>;
