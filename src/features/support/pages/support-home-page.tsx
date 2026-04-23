import { useNavigate } from "react-router-dom";
import { useCreateRoomMutation, useMyRoomsQuery } from "@/features/support/api/support";
import { RoomListCard } from "@/features/support/components/room-list-card";
import { AppErrorState } from "@/shared/ui/app-error-state";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { useToast } from "@/shared/ui/toast";
import { getErrorMessage } from "@/shared/api/error";

export function SupportHomePage() {
  const navigate = useNavigate();
  const roomsQuery = useMyRoomsQuery({ page: 1, size: 10 });
  const createRoomMutation = useCreateRoomMutation();
  const { showToast } = useToast();

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-border bg-surface p-6 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
          Customer Care
        </p>
        <h1 className="mt-3 text-3xl font-bold">문의 센터</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          고객은 OPEN 문의방을 생성하고, 필요 시 상담원 연결을 요청할 수 있습니다. 기존 문의방이
          있으면 재진입하고 없으면 새 문의방을 생성합니다.
        </p>
        <div className="mt-5">
          <Button
            onClick={() =>
              createRoomMutation.mutate(undefined, {
                onSuccess: (response) => navigate(`/support/rooms/${response.roomId}`),
                onError: (error) => showToast(getErrorMessage(error), "danger"),
              })
            }
            disabled={createRoomMutation.isPending}
          >
            {createRoomMutation.isPending ? "문의방 준비 중..." : "문의방 시작하기"}
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">내 문의방</h2>
        {roomsQuery.isLoading ? <div className="h-48 animate-pulse rounded-card bg-muted" /> : null}
        {roomsQuery.isError ? (
          <AppErrorState description="문의방 목록을 가져오지 못했습니다." onRetry={() => roomsQuery.refetch()} />
        ) : null}
        {!roomsQuery.isLoading && !roomsQuery.isError && !roomsQuery.data?.items.length ? (
          <EmptyState
            title="문의 이력이 없습니다."
            description="첫 문의를 시작하면 AI 응대와 상담원 요청 흐름을 바로 확인할 수 있습니다."
          />
        ) : null}
        <div className="grid gap-4">
          {roomsQuery.data?.items.map((room) => (
            <RoomListCard key={room.roomId} room={room} href={`/support/rooms/${room.roomId}`} />
          ))}
        </div>
      </section>
    </div>
  );
}
