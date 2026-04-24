import { useMyRoomsQuery } from "@/features/support/api/support";
import { RoomListCard } from "@/features/support/components/room-list-card";
import { AppErrorState } from "@/shared/ui/app-error-state";
import { EmptyState } from "@/shared/ui/empty-state";

export function SupportRoomsPage() {
  const roomsQuery = useMyRoomsQuery({ page: 1, size: 20 });

  if (roomsQuery.isLoading) {
    return <div className="h-48 animate-pulse rounded-card bg-muted" />;
  }

  if (roomsQuery.isError) {
    return <AppErrorState description="문의 목록을 불러오지 못했습니다." onRetry={() => roomsQuery.refetch()} />;
  }

  if (!roomsQuery.data?.items.length) {
    return (
      <EmptyState
        title="문의 내역이 없습니다."
        description="새 문의를 시작해 주세요."
      />
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-foreground">문의 목록</h1>
      <div className="grid gap-4">
        {roomsQuery.data.items.map((room) => (
          <RoomListCard key={room.roomId} room={room} href={`/support/rooms/${room.roomId}`} />
        ))}
      </div>
    </div>
  );
}
