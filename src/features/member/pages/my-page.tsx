import { Link } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";
import { readBookingDraft } from "@/features/booking/store/booking-draft";
import { useMyRoomsQuery } from "@/features/support/api/support";
import { Button } from "@/shared/ui/button";
import { formatDateTime } from "@/shared/lib/format";

export function MyPage() {
  const { user } = useAuth();
  const draft = readBookingDraft();
  const roomsQuery = useMyRoomsQuery({ page: 1, size: 3 });
  const upcomingTickets = draft?.hold ? [draft.hold] : [];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)_240px]">
        <aside className="rounded-card border border-border bg-white p-5 shadow-card">
          <h1 className="text-2xl font-black text-zinc-950">마이페이지</h1>
          <p className="mt-2 text-sm text-muted-foreground">나의 티켓, 취향, 활동을 한눈에!</p>
          <nav className="mt-5 space-y-2 text-sm font-black text-zinc-700">
            {["내 티켓", "찜한 공연", "최근 본 공연", "결제내역", "알림"].map((item, index) => (
              <p key={item} className={`rounded-full px-4 py-2 ${index === 0 ? "bg-violet-100 text-violet-700" : ""}`}>
                {item}
              </p>
            ))}
          </nav>
        </aside>

        <div className="rounded-card border border-border bg-white p-6 shadow-card">
          <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
            <div className="flex items-center gap-4">
              <div className="h-28 w-28 rounded-full bg-[linear-gradient(145deg,#ddd6fe,#f4f4f5)]" />
              <div>
                <h2 className="text-2xl font-black text-zinc-950">{user?.name ?? "티씨팬"}</h2>
                <span className="mt-2 inline-flex rounded-full bg-violet-600 px-3 py-1 text-xs font-black text-white">
                  TIXY BLACK
                </span>
                <p className="mt-4 text-sm text-muted-foreground">멋진 공연과 함께하는 하루, 당신의 취향을 응원해요!</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-5 md:grid-cols-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              {[
                ["보유 포인트", "25,680P"],
                ["보유 쿠폰", "3장"],
                ["예매한 공연", "12건"],
                ["찜한 공연", "18개"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-2 text-2xl font-black text-zinc-950">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-card border border-violet-200 bg-violet-100 p-5 shadow-card">
          <p className="text-sm font-black text-violet-700">이달의 활동 리포트</p>
          <h3 className="mt-3 text-xl font-black text-zinc-950">당신의 공연 취향은 감성 몰입형</h3>
          <Button className="mt-5" variant="secondary">리포트 보기</Button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-black text-zinc-950">관람 예정 티켓</h2>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-black text-muted-foreground">{upcomingTickets.length}건</span>
          </div>
          {upcomingTickets.length ? (
            upcomingTickets.map((ticket) => (
              <article key={`${ticket.eventTitle}-${ticket.sessionOpenDatetime}`} className="grid gap-4 rounded-card border border-border bg-white p-4 shadow-card md:grid-cols-[180px_minmax(0,1fr)_160px] md:items-center">
                <div className="aspect-[1.45/1] rounded-card bg-[linear-gradient(145deg,#ddd6fe,#d4d4d8)]" />
                <div>
                  <span className="rounded-full bg-violet-100 px-2 py-1 text-[11px] font-black text-violet-700">콘서트</span>
                  <h3 className="mt-3 text-xl font-black text-zinc-950">{ticket.eventTitle}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{formatDateTime(ticket.sessionOpenDatetime)}</p>
                  <p className="mt-1 text-sm font-bold text-zinc-800">{ticket.seatSectionName} · {ticket.seatLabels.join(", ")}</p>
                </div>
                <div className="space-y-2">
                  <Link to="/checkout/waiting-payment">
                    <Button fullWidth variant="secondary">모바일 티켓</Button>
                  </Link>
                  <Link to="/support">
                    <Button fullWidth variant="secondary">문의하기</Button>
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-card border border-border bg-white p-8 text-center shadow-card">
              <h3 className="text-lg font-black text-zinc-950">아직 예정된 티켓이 없습니다.</h3>
              <p className="mt-2 text-sm text-muted-foreground">마음에 드는 공연을 찾아 예매해 보세요.</p>
              <Link to="/search" className="mt-5 inline-block">
                <Button>공연 찾기</Button>
              </Link>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-card border border-border bg-white p-5 shadow-card">
            <h2 className="text-lg font-black text-zinc-950">내 일정 캘린더</h2>
            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
              {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                <span key={day} className="font-black">{day}</span>
              ))}
              {Array.from({ length: 35 }).map((_, index) => (
                <span key={index} className={`rounded-full py-1 ${index === 16 ? "bg-primary font-black text-zinc-950" : ""}`}>
                  {((index + 1) % 31) || 31}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-card border border-border bg-white p-5 shadow-card">
            <h2 className="text-lg font-black text-zinc-950">알림 센터</h2>
            <div className="mt-4 space-y-3">
              {(roomsQuery.data?.items ?? []).map((room) => (
                <Link key={room.roomId} to={`/support/rooms/${room.roomId}`} className="block rounded-card bg-zinc-50 p-3 text-sm">
                  <p className="font-black text-zinc-900">문의방 #{room.roomId}</p>
                  <p className="mt-1 text-xs text-muted-foreground">미읽음 {room.unreadCount}개</p>
                </Link>
              ))}
              {!roomsQuery.data?.items.length ? (
                <p className="text-sm text-muted-foreground">새 알림이 없습니다.</p>
              ) : null}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
