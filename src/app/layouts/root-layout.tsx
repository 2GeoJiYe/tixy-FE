import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/app/providers/auth-provider";
import { logout } from "@/features/auth/api/auth";
import { quickNavItems } from "@/features/events/showcase";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { FloatingRemote } from "@/shared/ui/floating-remote";
import { usePageAction } from "@/shared/ui/page-action-context";
import { useToast } from "@/shared/ui/toast";

export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, user, logout: clearSession } = useAuth();
  const { action } = usePageAction();
  const { showToast } = useToast();
  const showCustomerLinks = !user || user.role === "ROLE_USER";
  const logoutMutation = useMutation({
    mutationFn: () => logout(session?.accessToken ?? null),
    onSettled: () => {
      clearSession();
      showToast("로그아웃되었습니다.", "success");
      navigate("/");
    },
  });

  const getNavClassName = (isActive: boolean) =>
    cn(
      "relative whitespace-nowrap px-2 py-2 text-sm font-bold text-zinc-600 transition hover:text-zinc-950",
      isActive &&
        "text-zinc-950 after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary",
    );
  const navClassName = ({ isActive }: { isActive: boolean }) => getNavClassName(isActive);

  const isQuickNavActive = (to: string) => {
    const [targetPath, targetSearch = ""] = to.split("?");

    if (location.pathname !== targetPath) {
      return false;
    }

    if (!targetSearch) {
      return location.search === "";
    }

    const targetParams = new URLSearchParams(targetSearch);
    const currentParams = new URLSearchParams(location.search);
    const targetCategory = targetParams.get("category");

    if (targetCategory) {
      const currentCategories = currentParams.getAll("category");
      return currentCategories.length === 1 && currentCategories[0] === targetCategory;
    }

    const targetSort = targetParams.get("sort");

    if (targetSort) {
      return currentParams.get("sort") === targetSort && !currentParams.has("category");
    }

    if (targetParams.get("reservePossible") === "true") {
      return (
        currentParams.get("reservePossible") === "true" &&
        !currentParams.has("category") &&
        !currentParams.has("sort") &&
        !currentParams.has("q")
      );
    }

    return location.search === `?${targetSearch}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-container px-4 py-4 md:px-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex shrink-0 items-center gap-1">
              <span className="text-3xl font-black tracking-tight text-zinc-950">TIXY</span>
              <span className="mb-4 h-2.5 w-2.5 rotate-45 bg-primary" />
            </Link>

            <div className="ml-auto flex items-center gap-2">
              {showCustomerLinks ? (
                <>
                  <Link
                    to="/mypage"
                    className="hidden whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold text-zinc-700 transition hover:bg-zinc-100 md:inline-flex"
                  >
                    마이티켓
                  </Link>
                  <Link
                    to="/support"
                    className="hidden whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold text-zinc-700 transition hover:bg-zinc-100 md:inline-flex"
                  >
                    문의센터
                  </Link>
                </>
              ) : null}
              {user ? (
                <>
                  <div className="hidden text-right lg:block">
                    <p className="text-sm font-black text-foreground">{user.name}</p>
                    <p className="text-[11px] font-semibold text-muted-foreground">{user.role}</p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="min-h-10 px-4"
                  >
                    로그아웃
                  </Button>
                </>
              ) : (
                <Link to="/login">
                  <Button variant="secondary" className="min-h-10 px-5">
                    로그인
                  </Button>
                </Link>
              )}
              <Link to="/search?reservePossible=true" className="hidden md:block">
                <span className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full bg-primary px-5 text-sm font-black text-zinc-950 shadow-panel transition hover:brightness-95">
                  빠른 예매
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white">→</span>
                </span>
              </Link>
            </div>
          </div>

          <nav className="mt-3 flex gap-4 overflow-x-auto pb-1">
            {quickNavItems.map((item) => (
              <Link key={item.to} to={item.to} className={getNavClassName(isQuickNavActive(item.to))}>
                {item.label}
              </Link>
            ))}
            {showCustomerLinks ? (
              <>
                <Link to="/mypage" className={cn(getNavClassName(location.pathname === "/mypage"), "md:hidden")}>
                  마이티켓
                </Link>
                <Link
                  to="/support"
                  className={cn(getNavClassName(location.pathname.startsWith("/support")), "md:hidden")}
                >
                  문의센터
                </Link>
              </>
            ) : null}
            {user?.role === "ROLE_ADMIN" || user?.role === "ROLE_SUPER_ADMIN" ? (
              <NavLink to="/admin/support/queue" className={navClassName}>
                운영 콘솔
              </NavLink>
            ) : null}
            {user?.role === "ROLE_SUPER_ADMIN" ? (
              <NavLink to="/admin/dashboard/sales" className={navClassName}>
                판매 대시보드
              </NavLink>
            ) : null}
          </nav>
        </div>
      </header>

      <main
        className={cn(
          "mx-auto max-w-container px-4 py-6 md:px-6 md:py-8",
          action ? "pb-28 md:pb-8" : undefined,
        )}
      >
        <Outlet />
      </main>

      <footer className="border-t border-border/80 bg-white">
        <div className="mx-auto grid max-w-container gap-5 px-4 py-8 text-sm text-muted-foreground md:grid-cols-[160px_minmax(0,1fr)_auto] md:px-6">
          <Link to="/" className="flex items-start gap-1">
            <span className="text-3xl font-black tracking-tight text-zinc-950">TIXY</span>
            <span className="mt-1 h-2.5 w-2.5 rotate-45 bg-primary" />
          </Link>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-4 text-xs font-bold text-zinc-700">
              <span>회사소개</span>
              <span>이용약관</span>
              <span>개인정보처리방침</span>
              <span>청소년보호정책</span>
              <span>고객센터</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] leading-5 text-zinc-500">
              <span>(주)티씨</span>
              <span>대표 성기찬</span>
              <span>사업자등록번호 123-45-67890</span>
              <span>통신판매업신고 2026-서울마포-0426</span>
              <span>서울특별시 마포구 월드컵북로 12, 3층</span>
              <span>고객센터 1544-1234</span>
              <span>이메일 help@tixy.co.kr</span>
              <span>개인정보보호책임자 김티씨</span>
            </div>
            <p className="text-[11px] leading-5 text-zinc-400">
              TIXY는 통신판매중개자로서 공연 주최자가 등록한 상품 정보와 거래에 대한 책임은 각 주최자에게 있습니다.
              티켓 예매, 좌석 선택, 실시간 문의까지 TIXY에서 한 번에 관리하세요.
            </p>
          </div>
          <div className="flex gap-3 text-xs font-black text-zinc-500">
            <span>IG</span>
            <span>YT</span>
            <span>X</span>
            <span>TT</span>
          </div>
        </div>
      </footer>

      {action ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 py-3 shadow-panel backdrop-blur md:hidden">
          <div className="mx-auto max-w-container">{action}</div>
        </div>
      ) : null}

      <FloatingRemote showSupport={showCustomerLinks} />
    </div>
  );
}
