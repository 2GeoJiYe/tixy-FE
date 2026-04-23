import { useParams } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";
import { AdminRoomActions } from "@/features/admin-support/components/admin-room-actions";
import { useRoomDetailQuery } from "@/features/support/api/support";
import { SupportRoomThread } from "@/features/support/components/support-room-thread";
import { AppErrorState } from "@/shared/ui/app-error-state";

export function AdminSupportRoomPage() {
  const params = useParams();
  const roomId = Number(params.roomId);
  const { user } = useAuth();
  const roomQuery = useRoomDetailQuery(roomId);

  if (roomQuery.isLoading || !user) {
    return <div className="h-80 animate-pulse rounded-card bg-muted" />;
  }

  if (roomQuery.isError || !roomQuery.data) {
    return <AppErrorState description="문의방 상세를 불러오지 못했습니다." onRetry={() => roomQuery.refetch()} />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-card border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">운영자 문의 상세 #{roomQuery.data.roomId}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              status {roomQuery.data.status} · counselor {roomQuery.data.counselorUserId ?? "없음"}
            </p>
          </div>
          <AdminRoomActions room={roomQuery.data} currentUserId={user.id} role={user.role} />
        </div>
      </div>
      <SupportRoomThread
        room={roomQuery.data}
        currentUserId={user.id}
        readOnly={user.role === "ROLE_SUPER_ADMIN"}
      />
    </div>
  );
}
