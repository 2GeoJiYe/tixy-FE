import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/app/providers/auth-provider";
import { mainApiClient } from "@/shared/api/clients";
import type { ActiveSeatSection, OrderRequest, OrderResponse, SeatHoldRequest, SeatHoldResponse } from "@/features/booking/types";

export function useActiveSeatsQuery(sessionId: number) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["active-seats", sessionId],
    queryFn: () =>
      mainApiClient.request<ActiveSeatSection[]>("/seats/v1/active", {
        method: "GET",
        query: { eventSessionId: sessionId },
        token: accessToken,
        redirectOnUnauthorized: false,
      }),
    enabled: Number.isFinite(sessionId),
    refetchInterval: 15_000,
  });
}

async function holdSeats(token: string | null, request: SeatHoldRequest) {
  return mainApiClient.request<SeatHoldResponse>("/seats/v1/seat-hold", {
    method: "POST",
    token,
    body: request,
  });
}

async function createOrder(token: string | null, request: OrderRequest) {
  return mainApiClient.request<OrderResponse>("/orders/v1", {
    method: "POST",
    token,
    body: request,
  });
}

export function useSeatHoldMutation() {
  const { accessToken } = useAuth();
  return useMutation({
    mutationFn: (request: SeatHoldRequest) => holdSeats(accessToken, request),
  });
}

export function useCreateOrderMutation() {
  const { accessToken } = useAuth();
  return useMutation({
    mutationFn: (request: OrderRequest) => createOrder(accessToken, request),
  });
}
