import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/cn";

interface FloatingRemoteProps {
  showSupport?: boolean;
}

function scrollToPageEdge(top: boolean) {
  window.scrollTo({
    top: top ? 0 : document.documentElement.scrollHeight,
    behavior: "smooth",
  });
}

export function FloatingRemote({ showSupport = true }: FloatingRemoteProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const goToMyTickets = () => {
    navigate("/mypage");
  };

  const goToSupport = () => {
    const chatElement = document.getElementById("support-chat-thread");

    if (location.pathname.startsWith("/support/rooms") && chatElement) {
      chatElement.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    navigate("/support");
  };

  const itemClassName =
    "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-sm font-black text-zinc-800 shadow-card transition hover:-translate-y-0.5 hover:border-zinc-300";

  return (
    <div className="fixed bottom-4 right-3 z-40 flex flex-col items-center gap-2 rounded-full border border-border bg-white/90 p-2 shadow-panel backdrop-blur md:bottom-8 md:right-6">
      <button
        type="button"
        aria-label="맨 위로 이동"
        title="맨 위로"
        className={itemClassName}
        onClick={() => scrollToPageEdge(true)}
      >
        ↑
      </button>
      <button
        type="button"
        aria-label="맨 아래로 이동"
        title="맨 아래로"
        className={itemClassName}
        onClick={() => scrollToPageEdge(false)}
      >
        ↓
      </button>
      <button
        type="button"
        aria-label="내 티켓으로 이동"
        title="내 티켓"
        className={cn(itemClassName, !showSupport && "hidden")}
        onClick={goToMyTickets}
      >
        MY
      </button>
      <button
        type="button"
        aria-label="문의 채팅으로 이동"
        title="문의 채팅"
        className={cn(itemClassName, "bg-primary text-zinc-950", !showSupport && "hidden")}
        onClick={goToSupport}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.2"
        >
          <path d="M5 6.8C5 4.7 6.7 3 8.8 3h6.4C17.3 3 19 4.7 19 6.8v4.4c0 2.1-1.7 3.8-3.8 3.8h-3.4L7 19v-4.2c-1.2-.6-2-1.9-2-3.4V6.8Z" />
          <path d="M9 9.2h.01" />
          <path d="M12 9.2h.01" />
          <path d="M15 9.2h.01" />
        </svg>
      </button>
    </div>
  );
}
