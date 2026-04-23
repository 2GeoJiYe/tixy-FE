import { useMemo } from "react";
import {
  useClaimRoomMutation,
  useCloseRoomMutation,
  useReleaseRoomMutation,
  useSolveRoomMutation,
} from "@/features/support/api/support";
import type { RoomDetail } from "@/features/support/types";
import type { AppRole } from "@/shared/types/auth";
import { Button } from "@/shared/ui/button";
import { useToast } from "@/shared/ui/toast";
import { getErrorMessage } from "@/shared/api/error";

interface AdminRoomActionsProps {
  room: RoomDetail;
  currentUserId: number;
  role: AppRole;
}

export function AdminRoomActions({ room, currentUserId, role }: AdminRoomActionsProps) {
  const { showToast } = useToast();
  const claimMutation = useClaimRoomMutation(room.roomId);
  const releaseMutation = useReleaseRoomMutation(room.roomId);
  const solveMutation = useSolveRoomMutation(room.roomId);
  const closeMutation = useCloseRoomMutation(room.roomId);

  const canOperate = useMemo(() => {
    if (role === "ROLE_SUPER_ADMIN") {
      return true;
    }
    return room.counselorUserId == null || room.counselorUserId === currentUserId;
  }, [currentUserId, role, room.counselorUserId]);

  const run = (
    mutation:
      | typeof claimMutation
      | typeof releaseMutation
      | typeof solveMutation
      | typeof closeMutation,
    successMessage: string,
  ) => {
    mutation.mutate(undefined, {
      onSuccess: () => showToast(successMessage, "success"),
      onError: (error) => showToast(getErrorMessage(error), "danger"),
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        disabled={!canOperate || room.status !== "OPEN" || room.counselorUserId != null}
        onClick={() => run(claimMutation, "문의방을 배정했습니다.")}
      >
        배정
      </Button>
      <Button
        variant="secondary"
        disabled={!canOperate || room.status !== "OPEN" || room.counselorUserId == null}
        onClick={() => run(releaseMutation, "문의방을 다시 대기열로 돌렸습니다.")}
      >
        해제
      </Button>
      <Button
        variant="secondary"
        disabled={!canOperate || room.status !== "OPEN"}
        onClick={() => run(solveMutation, "문의방을 해결 처리했습니다.")}
      >
        해결
      </Button>
      <Button
        variant="danger"
        disabled={!canOperate || room.status === "CLOSED"}
        onClick={() => run(closeMutation, "문의방을 종료했습니다.")}
      >
        종료
      </Button>
    </div>
  );
}
