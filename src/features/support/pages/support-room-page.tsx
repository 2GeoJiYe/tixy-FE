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
    <div className="space-y-6">
      <section className="rounded-card border border-border bg-white p-6 shadow-panel">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_340px] md:items-center">
          <div>
            <p className="text-sm font-black text-violet-600">고객센터</p>
            <h1 className="mt-2 text-5xl font-black text-zinc-950">문의 채팅</h1>
            <p className="mt-3 text-sm text-muted-foreground">실시간 연결 상태와 문의 내용을 한 화면에서 확인하세요.</p>
          </div>
          <div className="rounded-card border border-violet-200 bg-violet-50 p-5">
            <p className="text-sm font-black text-violet-700">AI 상담 도우미 24시간 응답 중</p>
            <p className="mt-2 text-sm text-muted-foreground">상담원이 필요하면 언제든 연결을 요청할 수 있어요.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[270px_minmax(0,1fr)_250px]">
      <aside className="space-y-4">
        <div className="rounded-card border border-border bg-surface p-5 shadow-card">
          <h2 className="text-lg font-black text-foreground">문의 현황</h2>
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
        <div className="rounded-card border border-border bg-surface p-5 shadow-card">
          <h2 className="text-lg font-black text-foreground">상담 운영 안내</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            평일 10:00 - 18:00 운영하며 주말/공휴일은 휴무입니다.
          </p>
          <p className="mt-4 text-sm font-black text-zinc-950">현재 평균 응답 시간</p>
          <p className="mt-1 text-2xl font-black text-violet-600">3분 이내</p>
        </div>
      </aside>

      <SupportRoomThread room={room} currentUserId={user.id} />

      <aside className="space-y-4">
        <div className="rounded-card border border-border bg-white p-5 shadow-card">
          <h2 className="text-lg font-black text-zinc-950">예매 정보</h2>
          <div className="mt-4 rounded-card border border-border p-4">
            <p className="text-sm font-black text-zinc-950">SUMMER LIVE 2024</p>
            <p className="mt-2 text-xs text-muted-foreground">2024.06.21(금) 19:00</p>
            <button type="button" className="mt-4 w-full rounded-full border border-border px-4 py-2 text-sm font-bold">
              예매 상세 보기 →
            </button>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">좌석</dt>
              <dd className="font-bold text-zinc-950">1층 11구역 12열 15번</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">상태</dt>
              <dd className="font-black text-success">예매완료</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-card border border-border bg-white p-5 shadow-card">
          <h2 className="text-lg font-black text-zinc-950">자주 묻는 질문</h2>
          <div className="mt-4 divide-y divide-border text-sm text-zinc-700">
            {["좌석 변경은 어떻게 하나요?", "예매 취소 수수료는 어떻게 되나요?", "결제 수단 변경이 가능한가요?", "티켓 배송은 언제 되나요?"].map((item) => (
              <p key={item} className="py-3 font-bold">{item}</p>
            ))}
          </div>
        </div>
        <div className="rounded-card border border-border bg-white p-5 shadow-card">
          <h2 className="text-lg font-black text-zinc-950">빠른 도움</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {["예매 취소/환불", "좌석 변경하기", "티켓 배송 조회", "영수증 발급"].map((item) => (
              <button key={item} type="button" className="rounded-card bg-zinc-50 p-3 text-xs font-bold text-zinc-800">
                {item}
              </button>
            ))}
          </div>
        </div>
      </aside>
      </div>
    </div>
  );
}
