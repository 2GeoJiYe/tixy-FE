import { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";
import type { AppRole } from "@/shared/types/auth";

interface RequireAuthProps {
  roles?: AppRole[];
  fallback?: ReactNode;
}

export function RequireAuth({ roles, fallback }: RequireAuthProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      fallback ?? (
        <Navigate
          to="/login"
          state={{ redirectTo: `${location.pathname}${location.search}` }}
          replace
        />
      )
    );
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
