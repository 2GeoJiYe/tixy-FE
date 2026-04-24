import { useNavigate } from "react-router-dom";
import { useCreateRoomMutation, useMyRoomsQuery } from "@/features/support/api/support";
import { RoomListCard } from "@/features/support/components/room-list-card";
import { getErrorMessage } from "@/shared/api/error";
import { AppErrorState } from "@/shared/ui/app-error-state";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { useToast } from "@/shared/ui/toast";

export function SupportHomePage() {
  const navigate = useNavigate();
  const roomsQuery = useMyRoomsQuery({ page: 1, size: 10 });
  const createRoomMutation = useCreateRoomMutation();
  const { showToast } = useToast();

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-border bg-surface p-6 shadow-panel">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
              Customer Care
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">문의센터</h1>
          </div>
          <div>
            <Button
              onClick={() =>
                createRoomMutation.mutate(undefined, {
                  onSuccess: (response) => navigate(`/support/rooms/${response.roomId}`),
                  onError: (error) => showToast(getErrorMessage(error), "danger"),
                })
              }
              disabled={createRoomMutation.isPending}
            >
              {createRoomMutation.isPending ? "문의방 준비 중..." : "문의 시작"}
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">최근 문의</h2>
        {roomsQuery.isLoading ? <div className="h-48 animate-pulse rounded-card bg-muted" /> : null}
        {roomsQuery.isError ? (
          <AppErrorState description="문의 목록을 불러오지 못했습니다." onRetry={() => roomsQuery.refetch()} />
        ) : null}
        {!roomsQuery.isLoading && !roomsQuery.isError && !roomsQuery.data?.items.length ? (
          <EmptyState
            title="문의 내역이 없습니다."
            description="새 문의를 시작해 주세요."
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
