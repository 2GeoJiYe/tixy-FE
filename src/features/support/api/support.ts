import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/app/providers/auth-provider";
import { supportApiClient } from "@/shared/api/clients";
import type { QueryValue } from "@/shared/api/types";
import type {
  CreateRoomResponse,
  MessageCursorResponse,
  RequestCounselorResponse,
  RoomDetail,
  RoomListResponse,
  SupportListParams,
} from "@/features/support/types";

const supportKeys = {
  rooms: (scope: string, params?: SupportListParams) => ["support", scope, params] as const,
  room: (roomId: number) => ["support", "room", roomId] as const,
  messages: (roomId: number) => ["support", "messages", roomId] as const,
};

async function getList(
  token: string | null,
  path: string,
  params: SupportListParams | undefined,
) {
  return supportApiClient.request<RoomListResponse>(path, {
    method: "GET",
    token,
    query: params as Record<string, QueryValue> | undefined,
  });
}

export function useMyRoomsQuery(params?: SupportListParams) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: supportKeys.rooms("me", params),
    queryFn: () => getList(accessToken, "/support/v1/rooms/me", params),
    refetchInterval: 20_000,
  });
}

export function useAdminQueueQuery(params?: SupportListParams) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: supportKeys.rooms("queue", params),
    queryFn: () => getList(accessToken, "/admin/support/v1/queue", params),
    refetchInterval: 20_000,
  });
}

export function useAdminClosedRoomsQuery(params?: SupportListParams) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: supportKeys.rooms("closed", params),
    queryFn: () => getList(accessToken, "/admin/support/v1/rooms/closed", params),
    refetchInterval: 20_000,
  });
}

export function useAdminStaleRoomsQuery(params?: SupportListParams) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: supportKeys.rooms("stale", params),
    queryFn: () => getList(accessToken, "/admin/support/v1/rooms/stale", params),
    refetchInterval: 20_000,
  });
}

export function useRoomDetailQuery(roomId: number) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: supportKeys.room(roomId),
    queryFn: () =>
      supportApiClient.request<RoomDetail>(`/support/v1/rooms/${roomId}`, {
        method: "GET",
        token: accessToken,
      }),
    enabled: Number.isFinite(roomId),
  });
}

export function useRoomMessagesQuery(roomId: number) {
  const { accessToken } = useAuth();
  return useInfiniteQuery({
    queryKey: supportKeys.messages(roomId),
    initialPageParam: undefined as number | undefined,
    queryFn: ({ pageParam }) =>
      supportApiClient.request<MessageCursorResponse>(`/support/v1/rooms/${roomId}/messages`, {
        method: "GET",
        token: accessToken,
        query: { beforeMessageId: pageParam, size: 30 },
      }),
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor ?? undefined : undefined),
    enabled: Number.isFinite(roomId),
  });
}

export function useCreateRoomMutation() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      supportApiClient.request<CreateRoomResponse>("/support/v1/rooms", {
        method: "POST",
        token: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support", "me"] });
    },
  });
}

export function useRequestCounselorMutation(roomId: number) {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      supportApiClient.request<RequestCounselorResponse>(
        `/support/v1/rooms/${roomId}/counselor-request`,
        {
          method: "POST",
          token: accessToken,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.room(roomId) });
      queryClient.invalidateQueries({ queryKey: ["support"] });
    },
  });
}

function createAdminAction(pathBuilder: (roomId: number) => string) {
  return function useAction(roomId: number) {
    const { accessToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: () =>
        supportApiClient.request<{ roomId: number }>(pathBuilder(roomId), {
          method: "POST",
          token: accessToken,
        }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["support"] });
        queryClient.invalidateQueries({ queryKey: supportKeys.room(roomId) });
      },
    });
  };
}

export const useClaimRoomMutation = createAdminAction(
  (roomId) => `/admin/support/v1/rooms/${roomId}/claim`,
);
export const useReleaseRoomMutation = createAdminAction(
  (roomId) => `/admin/support/v1/rooms/${roomId}/release`,
);
export const useSolveRoomMutation = createAdminAction(
  (roomId) => `/admin/support/v1/rooms/${roomId}/solve`,
);
export const useCloseRoomMutation = createAdminAction(
  (roomId) => `/admin/support/v1/rooms/${roomId}/close`,
);
