import { useMemo } from "react";
import {
  useClaimRoomMutation,
  useCloseRoomMutation,
  useReleaseRoomMutation,
  useSolveRoomMutation,
} from "@/features/support/api/support";
import type { RoomDetail } from "@/features/support/types";
import type { AppRole } from "@/shared/types/auth";
import { getErrorMessage } from "@/shared/api/error";
import { Button } from "@/shared/ui/button";
import { useToast } from "@/shared/ui/toast";

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

  const permissions = useMemo(() => {
    const isAdmin = role === "ROLE_ADMIN";
    const isSuperAdmin = role === "ROLE_SUPER_ADMIN";
    const isOpen = room.status === "OPEN";
    const isClosed = room.status === "CLOSED";
    const hasCounselor = room.counselorUserId != null;
    const isAssignedToMe = room.counselorUserId === currentUserId;

    return {
      canClaim: isAdmin && isOpen && !hasCounselor,
      canRelease: isOpen && hasCounselor && (isSuperAdmin || isAssignedToMe),
      canSolve: isAdmin && isOpen && isAssignedToMe,
      canClose: isSuperAdmin && !isClosed,
      showClaim: isAdmin,
      showRelease: isAdmin || isSuperAdmin,
      showSolve: isAdmin,
      showClose: isSuperAdmin,
    };
  }, [currentUserId, role, room.counselorUserId, room.status]);

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
      {permissions.showClaim ? (
        <Button
          variant="secondary"
          disabled={!permissions.canClaim || claimMutation.isPending}
          onClick={() => run(claimMutation, "문의방을 배정했습니다.")}
        >
          배정
        </Button>
      ) : null}
      {permissions.showRelease ? (
        <Button
          variant="secondary"
          disabled={!permissions.canRelease || releaseMutation.isPending}
          onClick={() => run(releaseMutation, "문의방을 대기열로 돌렸습니다.")}
        >
          해제
        </Button>
      ) : null}
      {permissions.showSolve ? (
        <Button
          variant="secondary"
          disabled={!permissions.canSolve || solveMutation.isPending}
          onClick={() => run(solveMutation, "문의방을 해결 처리했습니다.")}
        >
          해결
        </Button>
      ) : null}
      {permissions.showClose ? (
        <Button
          variant="danger"
          disabled={!permissions.canClose || closeMutation.isPending}
          onClick={() => run(closeMutation, "문의방을 종료했습니다.")}
        >
          종료
        </Button>
      ) : null}
    </div>
  );
}
