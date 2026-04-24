import { useParams } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";
import {
  useRequestCounselorMutation,
  useRoomDetailQuery,
} from "@/features/support/api/support";
import { SupportRoomThread } from "@/features/support/components/support-room-thread";
import { getErrorMessage } from "@/shared/api/error";
import { formatDateTime } from "@/shared/lib/format";
import { AppErrorState } from "@/shared/ui/app-error-state";
import { Button } from "@/shared/ui/button";
import { useToast } from "@/shared/ui/toast";

export function SupportRoomPage() {
  const params = useParams();
  const roomId = Number(params.roomId);
  const { user } = useAuth();
  const { showToast } = useToast();
  const roomQuery = useRoomDetailQuery(roomId);
  const requestCounselorMutation = useRequestCounselorMutation(roomId);

  if (roomQuery.isLoading || !user) {
    return <div className="h-80 animate-pulse rounded-card bg-muted" />;
  }

  if (roomQuery.isError || !roomQuery.data) {
    return <AppErrorState description="문의방 정보를 불러오지 못했습니다." onRetry={() => roomQuery.refetch()} />;
  }

  const room = roomQuery.data;

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <div className="rounded-card border border-border bg-surface p-5 shadow-card">
          <h1 className="text-2xl font-bold text-foreground">문의 현황</h1>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">상태</dt>
              <dd className="mt-1 font-medium text-foreground">{room.status}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">상담 요청</dt>
              <dd className="mt-1 font-medium text-foreground">
                {room.customerRequestedCounselorAt
                  ? formatDateTime(room.customerRequestedCounselorAt)
                  : "요청 전"}
              </dd>
            </div>
          </dl>
          <div className="mt-5">
            <Button
              fullWidth
              variant="secondary"
              disabled={
                requestCounselorMutation.isPending ||
                room.status === "CLOSED" ||
                Boolean(room.customerRequestedCounselorAt)
              }
              onClick={() =>
                requestCounselorMutation.mutate(undefined, {
                  onSuccess: (response) => {
                    if (response.alreadyAssigned) {
                      showToast("상담원이 배정된 문의입니다.", "warning");
                    } else if (response.alreadyRequested) {
                      showToast("상담 요청이 접수되어 있습니다.", "warning");
                    } else {
                      showToast("상담 요청이 접수되었습니다.", "success");
                    }
                  },
                  onError: (error) => showToast(getErrorMessage(error), "danger"),
                })
              }
            >
              상담원 연결 요청
            </Button>
          </div>
        </div>
      </aside>

      <SupportRoomThread room={room} currentUserId={user.id} />
    </div>
  );
}
