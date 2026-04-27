import { KeyboardEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";
import {
  AdminRoomActions,
  type AdminRoomActionKind,
} from "@/features/admin-support/components/admin-room-actions";
import {
  useClaimRoomMutation,
  useRoomDetailQuery,
} from "@/features/support/api/support";
import { RoomListCard } from "@/features/support/components/room-list-card";
import { SupportRoomThread } from "@/features/support/components/support-room-thread";
import type { RoomDetail, RoomListResponse, RoomSummary } from "@/features/support/types";
import { getErrorMessage } from "@/shared/api/error";
import { cn } from "@/shared/lib/cn";
import { formatUtcDateTimeToKorea } from "@/shared/lib/format";
import type { AppRole } from "@/shared/types/auth";
import { AppErrorState } from "@/shared/ui/app-error-state";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { StatusBadge } from "@/shared/ui/status-badge";
import { useToast } from "@/shared/ui/toast";

type AdminSupportScope = "assigned" | "queue" | "closed" | "stale";

interface AdminSupportWorkspaceProps {
  title: string;
  scope: AdminSupportScope;
  list: RoomListResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

function getRoomStatusTone(status: RoomSummary["status"]) {
  if (status === "OPEN") {
    return "success";
  }

  if (status === "SOLVED") {
    return "warning";
  }

  return "muted";
}

function QueueClaimButton({
  room,
  role,
  fullWidth,
}: {
  room: RoomSummary;
  role: AppRole;
  fullWidth?: boolean;
}) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const claimMutation = useClaimRoomMutation(room.roomId);
  const canClaim = role === "ROLE_ADMIN" && room.status === "OPEN";

  return (
    <Button
      fullWidth={fullWidth}
      variant="primary"
      disabled={!canClaim || claimMutation.isPending}
      onClick={(event) => {
        event.stopPropagation();
        claimMutation.mutate(undefined, {
          onSuccess: (response) => {
            showToast(
              response.claimed === false
                ? "이미 내 계정에 배정된 문의입니다."
                : "문의방을 배정했습니다.",
              "success",
            );
            navigate(`/admin/support/rooms/${room.roomId}`);
          },
          onError: (error) => showToast(getErrorMessage(error), "danger"),
        });
      }}
    >
      {role === "ROLE_ADMIN" ? "배정받기" : "ADMIN 전용"}
    </Button>
  );
}

function AdminQueueRoomCard({
  room,
  role,
  selected,
  onSelect,
}: {
  room: RoomSummary;
  role: AppRole;
  selected: boolean;
  onSelect: () => void;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={cn(
        "rounded-card border bg-surface p-4 text-left shadow-card transition hover:border-zinc-300 hover:shadow-panel",
        selected ? "border-zinc-950" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-foreground">문의방 #{room.roomId}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            최근 메시지 {room.lastMessageAt ? formatUtcDateTimeToKorea(room.lastMessageAt) : "없음"}
          </p>
        </div>
        <StatusBadge label={room.status} tone={getRoomStatusTone(room.status)} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>{room.customerRequestedCounselorAt ? "상담원 요청" : "AI 응대 중"}</span>
        <span className="font-black text-zinc-950">미읽음 {room.unreadCount}</span>
      </div>
      {role === "ROLE_ADMIN" ? (
        <div className="mt-4">
          <QueueClaimButton room={room} role={role} fullWidth />
        </div>
      ) : null}
      {role === "ROLE_SUPER_ADMIN" ? (
        <div className="mt-4">
          <Button
            fullWidth
            variant="secondary"
            onClick={(event) => {
              event.stopPropagation();
              onSelect();
            }}
          >
            상세 보기
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function QueueSelectionPanel({ room, role }: { room: RoomSummary | undefined; role: AppRole }) {
  if (!room) {
    return null;
  }

  if (role === "ROLE_SUPER_ADMIN") {
    return (
      <section className="rounded-card border border-border bg-surface p-5 shadow-card">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">대기 문의</p>
          <h1 className="mt-1 text-2xl font-bold">문의방 #{room.roomId}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            상세 정보를 불러오는 중입니다.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-card border border-border bg-surface p-5 shadow-card">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">대기 문의</p>
          <h1 className="mt-1 text-2xl font-bold">문의방 #{room.roomId}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            배정 후 상담 상세 화면에서 메시지를 확인할 수 있습니다.
          </p>
        </div>
        <QueueClaimButton room={room} role={role} fullWidth />
      </div>
    </section>
  );
}

export function AdminSupportWorkspace({
  title,
  scope,
  list,
  isLoading,
  isError,
  onRetry,
}: AdminSupportWorkspaceProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const requestedRoomId = Number(searchParams.get("roomId") ?? 0);
  const selectedRoom =
    list?.items.find((room) => room.roomId === requestedRoomId) ?? list?.items[0];
  const selectedRoomId = selectedRoom?.roomId ?? requestedRoomId;
  const isQueue = scope === "queue";
  const shouldLoadRoomDetail = !isQueue || user?.role === "ROLE_SUPER_ADMIN";
  const roomQuery = useRoomDetailQuery(selectedRoomId, { enabled: shouldLoadRoomDetail });

  const handleRoomActionSuccess = (action: AdminRoomActionKind, room: RoomDetail) => {
    if (action === "release") {
      navigate(`/admin/support/queue?roomId=${room.roomId}`, { replace: true });
    }

    if (action === "close") {
      navigate(`/admin/support/rooms/closed?roomId=${room.roomId}`, { replace: true });
    }
  };

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-card bg-muted" />;
  }

  if (isError) {
    return <AppErrorState description={`${title} 목록을 불러오지 못했습니다.`} onRetry={onRetry} />;
  }

  if (!list?.items.length) {
    return (
      <EmptyState
        title={`${title}이 비어 있습니다.`}
        description="현재 조건에 해당하는 문의방이 없습니다."
      />
    );
  }

  if (!user) {
    return <div className="h-80 animate-pulse rounded-card bg-muted" />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="space-y-4">
        {list.items.map((room) =>
          isQueue ? (
            <AdminQueueRoomCard
              key={room.roomId}
              room={room}
              role={user.role}
              selected={room.roomId === selectedRoomId}
              onSelect={() => {
                setSearchParams((current) => {
                  const next = new URLSearchParams(current);
                  next.set("roomId", String(room.roomId));
                  return next;
                });
              }}
            />
          ) : (
            <RoomListCard
              key={room.roomId}
              room={room}
              onSelect={() => {
                setSearchParams((current) => {
                  const next = new URLSearchParams(current);
                  next.set("roomId", String(room.roomId));
                  return next;
                });
              }}
              href={`/admin/support/rooms/${room.roomId}`}
            />
          ),
        )}
      </aside>

      <section className="space-y-4">
        {!shouldLoadRoomDetail ? (
          <QueueSelectionPanel room={selectedRoom} role={user.role} />
        ) : roomQuery.isLoading ? (
          <div className="h-80 animate-pulse rounded-card bg-muted" />
        ) : roomQuery.isError || !roomQuery.data ? (
          <AppErrorState description="선택한 문의방 상세를 불러오지 못했습니다." />
        ) : (
          <>
            <div className="rounded-card border border-border bg-surface p-5 shadow-card">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold">문의방 #{roomQuery.data.roomId}</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    상담원 {roomQuery.data.counselorUserId ?? "미배정"} · {roomQuery.data.status}
                  </p>
                </div>
                <AdminRoomActions
                  room={roomQuery.data}
                  currentUserId={user.id}
                  role={user.role}
                  onActionSuccess={handleRoomActionSuccess}
                />
              </div>
              <div className="mt-4 xl:hidden">
                <Link
                  className="text-sm font-semibold text-primary"
                  to={`/admin/support/rooms/${roomQuery.data.roomId}`}
                >
                  전체 화면으로 열기
                </Link>
              </div>
            </div>
            <SupportRoomThread
              room={roomQuery.data}
              currentUserId={user.id}
              readOnly={user.role === "ROLE_SUPER_ADMIN"}
              showSuggestedQuestions={false}
              enableAiReplyIndicator={false}
            />
          </>
        )}
      </section>
    </div>
  );
}
