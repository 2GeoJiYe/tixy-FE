import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/app/providers/auth-provider";
import { mainApiClient } from "@/shared/api/clients";
import type { QueryValue } from "@/shared/api/types";
import type { EventItem, EventSearchFilters, EventSessionDetail, EventSessionPage, PopularEventItem } from "@/features/events/types";

const queryKeys = {
  list: (filters: EventSearchFilters, isPublic: boolean) => ["events", filters, isPublic] as const,
  detail: (eventId: number, isPublic: boolean) => ["event", eventId, isPublic] as const,
  popular: (category: string | undefined, isPublic: boolean) =>
    ["events", "popular", category ?? "all", isPublic] as const,
  sessions: (eventId: number) => ["event-sessions", eventId] as const,
  session: (eventId: number, sessionId: number) => ["event-session", eventId, sessionId] as const,
};

async function fetchEvents(
  filters: EventSearchFilters,
  token: string | null,
  isPublic: boolean,
) {
  return mainApiClient.request<EventItem[]>("/events/v1", {
    method: "GET",
    query: filters as Record<string, QueryValue>,
    token,
    redirectOnUnauthorized: !isPublic,
  });
}

async function fetchEventDetail(eventId: number, token: string | null, isPublic: boolean) {
  return mainApiClient.request<EventItem>(`/events/v1/${eventId}`, {
    method: "GET",
    token,
    redirectOnUnauthorized: !isPublic,
  });
}

async function fetchPopularEvents(category: string | undefined, token: string | null, isPublic: boolean) {
  return mainApiClient.request<PopularEventItem[]>("/v1/events/popular", {
    method: "GET",
    query: { category },
    token,
    redirectOnUnauthorized: !isPublic,
  });
}

async function fetchSessions(eventId: number, token: string | null, isPublic: boolean) {
  return mainApiClient.request<EventSessionPage>(`/event/v1/${eventId}/schedules`, {
    method: "GET",
    token,
    redirectOnUnauthorized: !isPublic,
  });
}

async function fetchSessionDetail(eventId: number, sessionId: number, token: string | null) {
  return mainApiClient.request<EventSessionDetail>(`/event/v1/${eventId}/schedules/${sessionId}`, {
    method: "GET",
    token,
  });
}

export function useEventsQuery(filters: EventSearchFilters, isPublic = true) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.list(filters, isPublic),
    queryFn: () => fetchEvents(filters, accessToken, isPublic),
  });
}

export function useEventDetailQuery(eventId: number, isPublic = true) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.detail(eventId, isPublic),
    queryFn: () => fetchEventDetail(eventId, accessToken, isPublic),
    enabled: Number.isFinite(eventId),
  });
}

export function usePopularEventsQuery(category?: string, isPublic = true) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.popular(category, isPublic),
    queryFn: () => fetchPopularEvents(category, accessToken, isPublic),
  });
}

export function useEventSessionsQuery(eventId: number, isPublic = true) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.sessions(eventId),
    queryFn: () => fetchSessions(eventId, accessToken, isPublic),
    enabled: Number.isFinite(eventId),
    retry: false,
  });
}

export function useEventSessionDetailQuery(eventId: number, sessionId: number, isPublic = true) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.session(eventId, sessionId),
    queryFn: () =>
      mainApiClient.request<EventSessionDetail>(`/event/v1/${eventId}/schedules/${sessionId}`, {
        method: "GET",
        token: accessToken,
        redirectOnUnauthorized: !isPublic,
      }),
    enabled: Number.isFinite(eventId) && Number.isFinite(sessionId),
    refetchInterval: 60_000,
    retry: false,
  });
}
