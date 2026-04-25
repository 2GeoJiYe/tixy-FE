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
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_320px] md:items-center">
          <div>
            <p className="text-sm font-black text-violet-600">고객센터</p>
            <h1 className="mt-3 text-5xl font-black leading-tight text-foreground">문의 채팅</h1>
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              티켓 예매부터 취소/환불까지, 무엇이든 도와드릴게요.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["예매문의", "결제문의", "취소/환불", "좌석문의", "기타"].map((label) => (
                <span key={label} className="rounded-full border border-border bg-white px-4 py-2 text-sm font-bold text-zinc-700">
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-card border border-violet-200 bg-violet-50 p-5">
            <p className="text-sm font-black text-violet-700">AI 상담 도우미 24시간 응답 중</p>
            <p className="mt-2 text-sm text-muted-foreground">자주 묻는 질문은 AI가 빠르게 답변해 드려요.</p>
            <Button
              className="mt-5"
              onClick={() =>
                createRoomMutation.mutate(undefined, {
                  onSuccess: (response) => navigate(`/support/rooms/${response.roomId}`),
                  onError: (error) => showToast(getErrorMessage(error), "danger"),
                })
              }
              disabled={createRoomMutation.isPending}
            >
              {createRoomMutation.isPending ? "문의방 준비 중..." : "AI 상담 시작하기 →"}
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_260px]">
        <aside className="space-y-4">
          <div className="rounded-card border border-border bg-white p-5 shadow-card">
            <h2 className="text-lg font-black text-zinc-950">문의 내역</h2>
            <p className="mt-1 text-sm text-muted-foreground">최근 대화와 응답 상태를 확인하세요.</p>
          </div>
          <div className="rounded-card border border-border bg-white p-5 shadow-card">
            <h2 className="text-lg font-black text-zinc-950">상담 운영 안내</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              평일 10:00 - 18:00 운영하며, AI 상담은 24시간 이용할 수 있습니다.
            </p>
            <p className="mt-4 text-sm font-black text-zinc-950">현재 평균 응답 시간</p>
            <p className="mt-1 text-2xl font-black text-violet-600">3분 이내</p>
          </div>
        </aside>

        <div className="space-y-4">
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
        </div>

        <aside className="space-y-4">
          <div className="rounded-card border border-border bg-white p-5 shadow-card">
            <h2 className="text-lg font-black text-zinc-950">빠른 도움</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {["예매 취소/환불", "좌석 변경하기", "티켓 배송 조회", "영수증 발급"].map((label) => (
                <button key={label} type="button" className="rounded-card bg-zinc-50 p-3 text-sm font-bold text-zinc-800">
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-card border border-border bg-white p-5 shadow-card">
            <h2 className="text-lg font-black text-zinc-950">유용한 링크</h2>
            <div className="mt-4 divide-y divide-border text-sm font-bold text-zinc-700">
              {["티켓 예매 가이드", "공연장 이용 안내", "취소/환불 규정", "1:1 문의하기"].map((label) => (
                <p key={label} className="py-3">{label} →</p>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
