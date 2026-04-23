import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";
import { cn } from "@/shared/lib/cn";

const items = [
  { label: "대기열", to: "/admin/support/queue" },
  { label: "종료 문의", to: "/admin/support/rooms/closed" },
  { label: "Stale 문의", to: "/admin/support/rooms/stale" },
  { label: "판매 대시보드", to: "/admin/dashboard/sales" },
];

export function AdminLayout() {
  const { user } = useAuth();
  const visibleItems = items.filter(
    (item) => item.to !== "/admin/dashboard/sales" || user?.role === "ROLE_SUPER_ADMIN",
  );

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-border bg-surface p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">Operations</p>
        <h1 className="mt-2 text-3xl font-bold">운영 콘솔</h1>
        <div className="mt-5 flex flex-wrap gap-2">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  isActive && "bg-primary text-primary-foreground hover:bg-primary",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </section>
      <Outlet />
    </div>
  );
}
