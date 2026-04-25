import { Link } from "react-router-dom";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatDateTime } from "@/shared/lib/format";
import type { RoomSummary } from "@/features/support/types";

interface RoomListCardProps {
  room: RoomSummary;
  href?: string;
  onSelect?: () => void;
}

export function RoomListCard({ room, href, onSelect }: RoomListCardProps) {
  const statusTone =
    room.status === "OPEN" ? "success" : room.status === "SOLVED" ? "warning" : "muted";

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-foreground">문의방 #{room.roomId}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            최근 메시지 {room.lastMessageAt ? formatDateTime(room.lastMessageAt) : "없음"}
          </p>
        </div>
        <StatusBadge label={room.status} tone={statusTone} />
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {room.customerRequestedCounselorAt ? "상담원 연결 요청됨" : "AI 우선 응대 중"}
        </span>
        <span className="font-black text-violet-600">미읽음 {room.unreadCount}</span>
      </div>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="w-full rounded-card border border-border bg-surface p-4 text-left shadow-card transition hover:border-violet-200 hover:shadow-panel"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={href ?? "#"}
      className="block rounded-card border border-border bg-surface p-4 shadow-card transition hover:border-violet-200 hover:shadow-panel"
    >
      {content}
    </Link>
  );
}
