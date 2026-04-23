import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";
import { RoomListCard } from "@/features/support/components/room-list-card";
import { SupportRoomThread } from "@/features/support/components/support-room-thread";
import { AdminRoomActions } from "@/features/admin-support/components/admin-room-actions";
import { useRoomDetailQuery } from "@/features/support/api/support";
import { AppErrorState } from "@/shared/ui/app-error-state";
import { EmptyState } from "@/shared/ui/empty-state";
import type { RoomListResponse } from "@/features/support/types";

interface AdminSupportWorkspaceProps {
  title: string;
  list: RoomListResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function AdminSupportWorkspace({
  title,
  list,
  isLoading,
  isError,
  onRetry,
}: AdminSupportWorkspaceProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const selectedRoomId = Number(searchParams.get("roomId") ?? list?.items[0]?.roomId ?? 0);
  const roomQuery = useRoomDetailQuery(selectedRoomId);

  useEffect(() => {
    if (!searchParams.get("roomId") && list?.items[0]) {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set("roomId", String(list.items[0].roomId));
        return next;
      });
    }
  }, [list?.items, searchParams, setSearchParams]);

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

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="space-y-4">
        {list.items.map((room) => (
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
        ))}
      </aside>

      <section className="space-y-4">
        {roomQuery.isLoading || !user ? (
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
                    counselorUserId: {roomQuery.data.counselorUserId ?? "미배정"} · status:{" "}
                    {roomQuery.data.status}
                  </p>
                </div>
                <AdminRoomActions room={roomQuery.data} currentUserId={user.id} role={user.role} />
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
            />
          </>
        )}
      </section>
    </div>
  );
}
