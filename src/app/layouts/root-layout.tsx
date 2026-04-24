import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/app/providers/auth-provider";
import { logout } from "@/features/auth/api/auth";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { usePageAction } from "@/shared/ui/page-action-context";
import { useToast } from "@/shared/ui/toast";

const navigationItems = [
  { label: "공연", to: "/" },
  { label: "검색", to: "/search" },
  { label: "문의센터", to: "/support" },
];

export function RootLayout() {
  const navigate = useNavigate();
  const { session, user, logout: clearSession } = useAuth();
  const { action } = usePageAction();
  const { showToast } = useToast();
  const logoutMutation = useMutation({
    mutationFn: () => logout(session?.accessToken ?? null),
    onSettled: () => {
      clearSession();
      showToast("로그아웃되었습니다.", "success");
      navigate("/");
    },
  });

  const navClassName = ({ isActive }: { isActive: boolean }) =>
    cn(
      "rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
      isActive && "bg-muted text-foreground",
    );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-container items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
              Tixy
            </span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navigationItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClassName}>
                {item.label}
              </NavLink>
            ))}
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

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden text-right md:block">
                  <p className="text-sm font-semibold text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="secondary">로그인</Button>
                </Link>
                <Link to="/signup" className="hidden md:block">
                  <Button>회원가입</Button>
                </Link>
              </>
            )}
          </div>
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

      <footer className="border-t border-border bg-white/80">
        <div className="mx-auto flex max-w-container items-center justify-between gap-3 px-4 py-5 text-sm text-muted-foreground md:px-6">
          <p>Tixy</p>
          <p>Ticketing & Support</p>
        </div>
      </footer>

      {action ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 py-3 shadow-panel md:hidden">
          <div className="mx-auto max-w-container">{action}</div>
        </div>
      ) : null}
    </div>
  );
}
